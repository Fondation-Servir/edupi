# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import mathfield


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0017_auto_20160426_1714'),
    ]

    operations = [
        migrations.AlterField(
            model_name='answer',
            name='content',
            field=mathfield.MathField(verbose_name='Content', help_text='Enter the answer text that you want displayed'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='question',
            name='content',
            field=mathfield.MathField(verbose_name='Question', help_text='Enter the question text that you want displayed'),
            preserve_default=True,
        ),
    ]
