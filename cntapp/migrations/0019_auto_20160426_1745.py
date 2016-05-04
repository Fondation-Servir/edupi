# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0018_auto_20160426_1739'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='question',
            name='quiz',
        ),
        migrations.AddField(
            model_name='question',
            name='quizz',
            field=models.ForeignKey(verbose_name='Quiz', blank=True, default=False, to='cntapp.Quiz'),
            preserve_default=False,
        ),
    ]
