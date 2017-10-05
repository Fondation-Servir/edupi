# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0020_auto_20160426_1747'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='description',
            field=models.TextField(blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='document',
            name='name',
            field=models.CharField(max_length=250),
            preserve_default=True,
        ),
    ]
