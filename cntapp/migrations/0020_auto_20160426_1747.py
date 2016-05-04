# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0019_auto_20160426_1745'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='question',
            name='quizz',
        ),
        migrations.AddField(
            model_name='question',
            name='quiz',
            field=models.ForeignKey(verbose_name='Quiz', to='cntapp.Quiz', default=False),
            preserve_default=False,
        ),
    ]
