import datetime

from django.dispatch.dispatcher import receiver

from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill
from django.db import models, transaction
from django.db.models.signals import post_save, post_delete, m2m_changed
from django.core.cache import cache
from django.utils.translation import ugettext as _

import logging
import mathfield

logger = logging.getLogger(__name__)

class Document(models.Model):
    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'

    TYPE_VIDEO = 'v'
    TYPE_PDF = 'p'
    TYPE_IMAGE = 'i'
    TYPE_AUDIO = 'a'
    TYPE_GOOGLE_APK = 'g'  # for google ;)
    TYPE_OTHERS = 'o'
    TYPES = (
        (TYPE_VIDEO, 'video'),
        (TYPE_AUDIO, 'sound'),
        (TYPE_PDF, 'pdf'),
        (TYPE_GOOGLE_APK, 'google_apk'),
        (TYPE_IMAGE, 'image'),
        (TYPE_OTHERS, 'others'),
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=2, choices=TYPES, blank=True)
    description = models.CharField(max_length=250, blank=True)
    file = models.FileField()
    thumbnail = ProcessedImageField(upload_to='thumbnails', blank=True, null=True,
                                    processors=[ResizeToFill(150, 150)],
                                    format='PNG',
                                    options={'quality': 50})

    def __str__(self):
        return self.name


class Link(models.Model):
    class Meta:
        verbose_name = 'Lien'
        verbose_name_plural = 'Liens'

    name = models.CharField(max_length=100)
    url = models.CharField(max_length=255)
    description = models.TextField(max_length=250, blank=True)

    def __str__(self):
        return self.name

class Quiz(models.Model):
	class Meta:
		verbose_name = _('Quiz')
		verbose_name_plural = _('Quizzes')

	name = models.CharField(verbose_name=_("Title"), max_length=60, blank=False)
	description = models.TextField(verbose_name=_("Description"), blank=True, help_text=_("a description of the quiz"))

	def save(self, force_insert=False, force_update=False, *args, **kwargs):
#		if self.pass_mark > 100:
#		    raise ValidationError('%s is above 100' % self.pass_mark)

		super(Quiz, self).save(force_insert, force_update, *args, **kwargs)

	def __str__(self):
	    return self.name

	def get_questions(self):
	    return self.question_set.all().select_subclasses()

	@property
	def get_max_score(self):
	    return self.get_questions().count()

class Question(models.Model):
	quiz = models.ForeignKey(Quiz,
	                              verbose_name=_("Quiz"))

	figure = models.ImageField(upload_to='uploads/%Y/%m/%d',
	                           blank=True,
	                           null=True,
	                           verbose_name=_("Figure"))

	content = mathfield.MathField(blank=False,
	                           help_text=_("Enter the question text that "
	                                       "you want displayed"),
	                           verbose_name=_('Question'))

	explanation = models.TextField(max_length=2000,
	                               blank=True,
	                               help_text=_("Explanation to be shown "
	                                           "after the question has "
	                                           "been answered."),
	                               verbose_name=_('Explanation'))

	class Meta:
	    verbose_name = _("Question")
	    verbose_name_plural = _("Questions")

	def __str__(self):
		return _('Quiz') + ' "' + self.quiz.name + '" ' + _("Question") + ' ' + str(self.id)

	def order_answers(self, queryset):
 		return queryset.order_by('?')

	def get_answers(self):
	    return self.order_answers(Answer.objects.filter(question=self))

	def get_answers_list(self):
	    return [(answer.id, answer.content) for answer in
	            self.order_answers(Answer.objects.filter(question=self))]

	def answer_choice_to_string(self, guess):
	    return Answer.objects.get(id=guess).content

class Answer(models.Model):
	question = models.ForeignKey(Question, verbose_name=_("Question"))

	content = mathfield.MathField(blank=False,
	                           help_text=_("Enter the answer text that "
	                                       "you want displayed"),
	                           verbose_name=_("Content"))

	correct = models.BooleanField(blank=False,
	                              default=False,
	                              help_text=_("Is this a correct answer?"),
	                              verbose_name=_("Correct"))

	def __str__(self):
	    return _("Question") + ' ' + str(self.question.id) + ' ' + _("Answer") + ' ' +  str(self.id)

	class Meta:
	    verbose_name = _("Réponse")
	    verbose_name_plural = _("Réponses")

# Receive the post signal and delete the file associated with the document instance.
@receiver(post_delete, sender=Document)
def document_delete(sender, instance, **kwargs):
    instance.file.delete(False)
    instance.thumbnail.delete(False)

class Directory(models.Model):
    class Meta:
        verbose_name = 'Dossier'
        verbose_name_plural = "Dossiers"

    MAX_NAME_LEN = 255
    name = models.CharField(max_length=MAX_NAME_LEN)
    documents = models.ManyToManyField(Document, blank=True)
    links = models.ManyToManyField(Link, blank=True)
    quizz = models.ManyToManyField(Quiz, blank=True)
    sub_dirs = models.ManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        through='SubDirRelation',
        through_fields=('parent', 'child'))

    def get_sub_dirs(self):
        return self.sub_dirs.all()

    def get_sub_dir_by_name(self, name):
        dirs = self.get_sub_dirs()
        return dirs.get(name=name)

    def get_parents(self):
        return self.directory_set.all()

    def get_paths(self):
        """ return paths recursively
        """
        parents = self.get_parents()
        if parents.count() == 0:
            return [[self]]

        paths = []
        for p in parents:
            p_paths = p.get_paths()
            for p_path in p_paths:
                p_path.append(self)
            paths.extend(p_paths)
        return paths

    def add_sub_dir(self, sub_dir):
        if len(SubDirRelation.objects.filter(parent=self, child=sub_dir)) > 0:
            logger.warn('SubDirRelation already exists between parent_id=%d and child_id=%d' % (
                self.id, sub_dir.id))
            return self
        SubDirRelation.objects.create(parent=self, child=sub_dir)
        return self

    @transaction.atomic
    def remove_sub_dir(self, sub_dir):
        """ Remove recursively a sub directory.

        Delete the directories that have only one parent.
        Only delete the parent-child relation for the directories that have multiple parents."""
        l = SubDirRelation.objects.get(parent=self, child=sub_dir)
        l.delete()
        if len(sub_dir.get_parents()) == 0:
            for d in sub_dir.get_sub_dirs():
                sub_dir.remove_sub_dir(d)
            Directory.objects.get(pk=sub_dir.pk).delete()

    def unlink_sub_dir(self, sub_dir):
        try:
            l = SubDirRelation.objects.get(parent=self, child=sub_dir)
            l.delete()
            return True
        except models.ObjectDoesNotExist as e:
            logger.warn('No SubDirRelation found between parent_id=%d and child_id=%d: %s' % (
                self.id, sub_dir.id, e
            ))
            return False

    def __str__(self):
        return self.name


class SubDirRelation(models.Model):
    parent = models.ForeignKey(Directory, related_name='parent')
    child = models.ForeignKey(Directory, related_name='child')

def change_api_updated_at(sender=None, instance=None, *args, **kwargs):
    cache.set('api_updated_at_timestamp', datetime.datetime.utcnow())

for model in [Document, Link, Directory, Quiz, Question, Answer, SubDirRelation]:
    post_save.connect(receiver=change_api_updated_at, sender=model)
    post_delete.connect(receiver=change_api_updated_at, sender=model)

for through in [Directory.sub_dirs.through, Directory.documents.through, Directory.links.through, Directory.quizz.through]:
    m2m_changed.connect(receiver=change_api_updated_at, sender=through)
