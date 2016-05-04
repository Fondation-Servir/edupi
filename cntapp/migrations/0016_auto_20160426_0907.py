# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0015_directory_quizz'),
    ]

    operations = [
        migrations.RenameField(
            model_name='quiz',
            old_name='title',
            new_name='name',
        ),
    ]
