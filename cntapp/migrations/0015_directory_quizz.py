# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0014_auto_20160426_0833'),
    ]

    operations = [
        migrations.AddField(
            model_name='directory',
            name='quizz',
            field=models.ManyToManyField(to='cntapp.Quiz', blank=True),
            preserve_default=True,
        ),
    ]
