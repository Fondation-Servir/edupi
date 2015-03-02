from django.db import models


class Document(models.Model):
    TYPE_VIDEO = 'v'
    TYPE_PDF = 'p'
    TYPE_IMAGE = 'i'
    TYPE_SOUND = 's'
    TYPE_OTHERS = 'o'
    TYPES = (
        (TYPE_VIDEO, 'video'),
        (TYPE_SOUND, 'sound'),
        (TYPE_PDF, 'pdf'),
        (TYPE_IMAGE, 'image'),
        (TYPE_OTHERS, 'others'),
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=2, choices=TYPES)
    description = models.CharField(max_length=250)

    def get_parents(self):
        pass

    def __str__(self):
        return self.name


class Directory(models.Model):
    name = models.CharField(max_length=255)
    documents = models.ManyToManyField(Document)
    sub_dirs = models.ManyToManyField(
        'self',
        symmetrical=False,
        through='SubDirRelation',
        through_fields=('parent', 'child'))

    def get_documents(self):
        return self.documents.all()

    def get_sub_dirs(self):
        return self.sub_dirs.all()

    def get_parents(self):
        return self.directory_set.all()

    def add_sub_dir(self, sub_dir):
        if len(SubDirRelation.objects.filter(parent=self, child=sub_dir)) > 0:
            # TODO: warning
            return self
        SubDirRelation.objects.create(parent=self, child=sub_dir)
        return self

    def remove_sub_dir(self, sub_dir):
        l = SubDirRelation.objects.get(parent=self, child=sub_dir)
        if l is None:
            # TODO: warning
            return
        l.delete()
        if len(sub_dir.get_parents()) == 0:
            for d in sub_dir.get_sub_dirs():
                sub_dir.remove_sub_dir(d)
            Directory.objects.get(pk=sub_dir.pk).delete()

    def __str__(self):
        return self.name


class SubDirRelation(models.Model):
    parent = models.ForeignKey(Directory, related_name='parent')
    child = models.ForeignKey(Directory, related_name='child')
