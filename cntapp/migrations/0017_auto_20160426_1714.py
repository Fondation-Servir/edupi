# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import mathfield


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0016_auto_20160426_0907'),
    ]

    operations = [
        migrations.AlterField(
            model_name='answer',
            name='content',
            field=mathfield.MathField(verbose_name='Content', help_text='Enter the answer text that you want displayed', max_length=1000),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='question',
            name='content',
            field=mathfield.MathField(verbose_name='Question', help_text='Enter the question text that you want displayed', max_length=1000),
            preserve_default=True,
        ),
    ]
