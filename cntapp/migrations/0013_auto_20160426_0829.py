# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0012_auto_20160421_2219'),
    ]

    operations = [
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='ID', auto_created=True)),
                ('content', models.CharField(max_length=1000, help_text='Enter the answer text that you want displayed', verbose_name='Content')),
                ('correct', models.BooleanField(default=False, help_text='Is this a correct answer?', verbose_name='Correct')),
            ],
            options={
                'verbose_name_plural': 'Answers',
                'verbose_name': 'Answer',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='ID', auto_created=True)),
                ('figure', models.ImageField(blank=True, upload_to='uploads/%Y/%m/%d', verbose_name='Figure', null=True)),
                ('content', models.CharField(max_length=1000, help_text='Enter the question text that you want displayed', verbose_name='Question')),
                ('explanation', models.TextField(max_length=2000, blank=True, help_text='Explanation to be shown after the question has been answered.', verbose_name='Explanation')),
            ],
            options={
                'verbose_name_plural': 'Questions',
                'verbose_name': 'Question',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Quiz',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, verbose_name='ID', auto_created=True)),
                ('title', models.CharField(max_length=60, verbose_name='Title')),
                ('description', models.TextField(blank=True, help_text='a description of the quiz', verbose_name='Description')),
            ],
            options={
                'verbose_name_plural': 'Quizzes',
                'verbose_name': 'Quiz',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='question',
            name='quiz',
            field=models.ManyToManyField(blank=True, to='cntapp.Quiz', verbose_name='Quiz'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='answer',
            name='question',
            field=models.ForeignKey(verbose_name='Question', to='cntapp.Question'),
            preserve_default=True,
        ),
    ]
