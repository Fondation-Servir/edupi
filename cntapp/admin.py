from django.contrib import admin
from django import forms
import mathfield

from cntapp.models import Directory, Document, Link, Quiz, Question, Answer

class DirectoryInline(admin.TabularInline):
    model = Directory.sub_dirs.through
    fk_name = 'parent'
    extra = 1

class DirectoryParentsInline(admin.TabularInline):
    model = Directory.sub_dirs.through
    fk_name = 'child'
    extra = 1

class DirectoryDocumentInline(admin.TabularInline):
    model = Directory.documents.through
    extra = 1

class DirectoryLinkInline(admin.TabularInline):
    model = Directory.links.through
    extra = 1

class DirectoryQuizInline(admin.TabularInline):
    model = Directory.quizz.through
    extra = 1

@admin.register(Link)
class LinkAdmin(admin.ModelAdmin):
    inlines = (DirectoryLinkInline, )

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    inlines = (DirectoryDocumentInline, )

@admin.register(Directory)
class DirectoryAdmin(admin.ModelAdmin):
    fieldsets = [
        ('Directory Information', {'fields': ['name']}),
    ]
    inlines = (DirectoryInline, DirectoryParentsInline)

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 1

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

class QuestionForm(forms.ModelForm):
	class Meta:
		widgets = {
			'content': mathfield.MathFieldWidget
		}

class AnswerForm(forms.ModelForm):
	class Meta:
		widgets = {
			'content': mathfield.MathFieldWidget
		}

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
	form = AnswerForm

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
	inlines = (AnswerInline, )
	form = QuestionForm

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    inlines = (QuestionInline, DirectoryQuizInline)