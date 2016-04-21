# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0008_auto_20160421_1953'),
    ]

    operations = [
        migrations.AddField(
            model_name='directory',
            name='links',
            field=models.ManyToManyField(to='cntapp.Link', blank=True),
            preserve_default=True,
        ),
    ]
