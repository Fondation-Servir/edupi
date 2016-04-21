# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cntapp', '0007_auto_20150502_2017'),
    ]

    operations = [
        migrations.CreateModel(
            name='Link',
            fields=[
                ('id', models.AutoField(primary_key=True, auto_created=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('link', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name_plural': 'Liens',
                'verbose_name': 'Lien',
            },
            bases=(models.Model,),
        ),
        migrations.AlterModelOptions(
            name='directory',
            options={'verbose_name_plural': 'Dossiers', 'verbose_name': 'Dossier'},
        ),
        migrations.AlterModelOptions(
            name='document',
            options={'verbose_name_plural': 'Documents', 'verbose_name': 'Document'},
        ),
    ]
