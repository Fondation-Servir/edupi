"""
reference: https://github.com/hjwp/book-example/blob/master/deploy_tools/fabfile.py
"""

from fabric.contrib.files import exists
from fabric.api import run, settings, put

from deploy.edupi import EdupiDeployManager
from deploy.settings import RASP_USER_NAME
from deploy.helper import send_file

import os.path

__all__ = [
    'config_hotspot',
    'install_deps',
    'deploy_edupi',
    'uninstall_edupi',
    'deploy_index_page',
    'deploy_wikifundi',
    'deploy_kalite',
    'deploy_education_et_numerique',
    'deploy_aflatoun',
    'deploy_kiwix'
]

PORTAL_SITE_NAME = 'shammesh.org'

def install_deps():
    run('sudo apt-get update')
    _apt_get(' '.join(['nginx', 'python3-pip', 'libmagickwand-dev', 'git-core', 'supervisor']))

    run('sudo pip3 install virtualenv')
    _install_node_and_npm()
    _install_bower()


def config_hotspot():
    run('sudo apt-get update')
    run('sudo apt-get install -y hostapd dnsmasq')
    config_files = [
        '/etc/network/interfaces',
        '/etc/dnsmasq.conf',
        '/etc/resolvconf.conf',
        '/etc/hostapd/hostapd.conf.orig',
        '/etc/rc.local',
        ]

    list(map(send_file, config_files))
    run('sudo reboot')


def deploy_edupi(commit='origin/release', user='Fondation-Servir'):
    manager = EdupiDeployManager()
    manager.deploy(commit, user.strip())


def uninstall_edupi(purge_data=False):
    manager = EdupiDeployManager()
    manager.uninstall(purge_data)

def deploy_education_et_numerique():
    site_folder = '/home/%s/sites/education-et-numerique.shammesh.org' % RASP_USER_NAME

    if not exists(site_folder) and not exists('/home/%s/sites/artefact-v2.0.0.tar.gz' % RASP_USER_NAME):
        if not os.path.isfile('/home/source/artefact-v2.0.0.tar.gz'):
            print 'Please put Education and Numerique source file "artefact-v2.0.0.tar.gz" in the folder "/home/source/"'
            exit
        put('/home/source/artefact-v2.0.0.tar.gz', '/home/%s/sites/' % RASP_USER_NAME)

    if not exists(site_folder):
        run('cd /home/%s/sites/ && tar -xvf /home/%s/sites/artefact-v2.0.0.tar.gz' % (RASP_USER_NAME, RASP_USER_NAME))
        run('cd /home/%s/sites/ && mv artefact %s' % (RASP_USER_NAME, site_folder))
        run('rm -Rf /home/%s/sites/artefact-v2.0.0.tar.gz' % RASP_USER_NAME)

    # Nginx conf
    send_file('/etc/nginx/sites-enabled/education-et-numerique.shammesh.org', mod='644')

    run('sudo service nginx restart')

def deploy_aflatoun():
    site_folder = '/home/%s/sites/aflatoun.shammesh.org' % RASP_USER_NAME

    # Install dependencies
    run('sudo apt-get install -y unzip')

    # Upload sources
    if not exists(site_folder) and not exists('/home/%s/sites/aflatoundist.zip' % RASP_USER_NAME):
        if not os.path.isfile('/home/source/aflatoundist.zip'):
            print 'Please put Aflatoun source file "aflatoundist.zip" in the folder "/home/source/"'
            exit
        put('/home/source/aflatoundist.zip', '/home/%s/sites/' % RASP_USER_NAME)

    # Unzip file
    if not exists(site_folder):
        run('cd /home/%s/sites/ && unzip /home/%s/sites/aflatoundist.zip' % (RASP_USER_NAME, RASP_USER_NAME))
        run('cd /home/%s/sites/ && mv aflatoundist %s' % (RASP_USER_NAME, site_folder))
        run('cd %s && sudo bash install_aflatoun_kalite.sh' % site_folder)
        run('rm -Rf /home/%s/sites/aflatoundist.zip' % RASP_USER_NAME)

    # Nginx conf
    send_file('/etc/nginx/sites-enabled/aflatoun.shammesh.org', mod='644')
    send_file('/etc/nginx/sites-enabled/kalite.shammesh.org', mod='644')

    run('sudo service nginx restart')
    run('sudo service aflatounkalite restart')
    run('sudo service ka-lite restart')

def deploy_kiwix():
    # Change supervisor config if change path
    site_folder = '/home/%s/sites/kiwix' % RASP_USER_NAME

    # Install dependencies
    run('sudo apt-get install -y supervisor')

    # Create dirs
    run('mkdir -p %s' % site_folder)
    run('mkdir -p %s/library/' % site_folder)
    run('mkdir -p %s/library/zim/' % site_folder)

    # Fetch sources and install
    if not exists('%s/kiwix-serve' % site_folder):
        run('cd /tmp/ && sudo wget http://download.kiwix.org/bin/kiwix-server-arm.tar.bz2')
        run('tar -xvf /tmp/kiwix-server-*.bz2 -C %s' % site_folder)

    # Fetch ZIM librairies
    if not exists('%s/library/zim/vikidia_fr_all.zim' % site_folder):
        run('sudo wget http://download.kiwix.org/zim/vikidia_fr_all.zim -O %s/library/zim/vikidia_fr_all.zim' % site_folder)
        run('sudo %s/kiwix-manage %s/library/library.xml add %s/library/zim/vikidia_fr_all.zim' % (site_folder, site_folder, site_folder))
    if not exists('%s/library/zim/wikibooks_fr_all.zim' % site_folder):
        run('sudo wget http://download.kiwix.org/zim/wikibooks_fr_all.zim -O %s/library/zim/wikibooks_fr_all.zim' % site_folder)
        run('sudo %s/kiwix-manage %s/library/library.xml add %s/library/zim/wikibooks_fr_all.zim' % (site_folder, site_folder, site_folder))
    if not exists('%s/library/zim/gutenberg_fr_all.zim' % site_folder):
        run('sudo wget http://download.kiwix.org/zim/gutenberg_fr_all.zim -O %s/library/zim/gutenberg_fr_all.zim' % site_folder)
        run('sudo %s/kiwix-manage %s/library/library.xml add %s/library/zim/gutenberg_fr_all.zim' % (site_folder, site_folder, site_folder))
    if not exists('%s/library/zim/wikipedia_fr_all.zim' % site_folder):
        run('sudo wget http://download.kiwix.org/zim/wikipedia_fr_all.zim -O %s/library/zim/wikipedia_fr_all.zim' % site_folder)
        run('sudo %s/kiwix-manage %s/library/library.xml add %s/library/zim/wikipedia_fr_all.zim' % (site_folder, site_folder, site_folder))
    if not exists('%s/library/zim/wiktionary_fr_all.zim' % site_folder):
        run('sudo wget http://download.kiwix.org/zim/wiktionary_fr_all.zim -O %s/library/zim/wiktionary_fr_all.zim' % site_folder)
        run('sudo %s/kiwix-manage %s/library/library.xml add %s/library/zim/wiktionary_fr_all.zim' % (site_folder, site_folder, site_folder))

    # Install service
    send_file('/etc/supervisor/conf.d/kiwix.conf', mod='644')
    send_file('/etc/nginx/sites-enabled/kiwix.shammesh.org', mod='644')
    send_file('/etc/nginx/conf.d/edupi.conf', mod='644')
    run('sudo service supervisor restart')
    run('sudo service nginx restart')

def deploy_kalite():
    # Install dependencies
    run('sudo apt-get install -y python-m2crypto python-pkg-resources nginx python-psutil')
    # Fetch the latest .deb
    run('cd /tmp/ && sudo wget https://learningequality.org/r/deb-pi-installer-0-16 --no-check-certificate --content-disposition')
    # Install the .deb
    run('sudo dpkg -i /tmp/ka-lite-raspberry-pi*.deb')

def deploy_wikifundi():
    site_folder = '/home/%s/sites/wikifundi.shammesh.org' % RASP_USER_NAME
    parsoid_folder = '/home/%s/sites/parsoid' % RASP_USER_NAME
    repo_url = 'http://download.kiwix.org/other/wikifundi/fr.africapack.kiwix.org_2016-08.tar.bz2'
    parsoid_url = 'http://download.kiwix.org/other/wikifundi/parsoid_2016-08.tar.bz2'

    # install deps
    run('sudo apt-get install -y supervisor nginx php5-fpm memcached nodejs imagemagick texlive php5-curl php5-sqlite libav-tools librsvg2-bin poppler-utils redis-server lua5.1')

    # create site folder
    run('mkdir -p %s' % site_folder)

    # Get source
    if not exists(site_folder):
        run('mkdir -p %s' % site_folder)
        run('cd %s && rm -fr *' % site_folder)
    if not exists('%s/mw_fr_africapack.sqlite' % site_folder):
        run('wget %s -O /tmp/wikifundi.bz2' % repo_url)
        run('tar -xvf /tmp/wikifundi.bz2 -C %s' % site_folder)
        run('cd %s && sudo mv fr.africapack.kiwix.org/* . && sudo rm -Rf fr.africapack.kiwix.org' % site_folder)
        run('sudo chown www-data:www-data -R .')
        run('rm -Rf /tmp/wikifundi.bz2')

    # Nginx conf
    send_file('/etc/nginx/sites-enabled/wikifundi.shammesh.org', mod='644')
    run('grep -q "wikifundi.shammesh.org" /etc/hosts || echo "127.0.0.1 wikifundi.shammesh.org" | sudo tee -a /etc/hosts')

    # Install parsoid
    if not exists(parsoid_folder):
        run('wget %s -O /tmp/parsoid.tar.bz2' % parsoid_url)
        run('cd /tmp/ && tar -xvf /tmp/parsoid.tar.bz2')
        run('sudo mv /tmp/parsoid %s && sudo chown -R www-data:www-data %s' % (parsoid_folder, parsoid_folder))
        run('cd /usr/bin/ && sudo ln -s nodejs node')
        run('rm -Rf /tmp/parsoid.tar.bz2')
        #Do not forget to customize your parsoid configuration in
        #/var/www/parsoid/localsettings.js
        #To start the Parsoid daemon, run /var/www/parsoid/bin/server.js

    send_file('/etc/supervisor/conf.d/wikifundi_parsoid.conf', mod='644')
    send_file('%s/w/LocalSettings.custom.php' % site_folder, mod='644')
    send_file('%s/localsettings.js' % parsoid_folder, mod='644')

    # Install math rendering with latex
    run('sudo apt-get install -y build-essential dvipng ocaml cjk-latex texlive-fonts-recommended texlive-lang-greek texlive-latex-recommended')
    run('cd %s/w/extensions/Math/math && sudo make all' % site_folder)
    run('cd %s/w/extensions/Math/texvccheck && sudo make all' % site_folder)
    run('cd %s/w/extensions/Math/ && sudo chown -R www-data:www-data %s' % (site_folder, site_folder))
    run('cd %s/w/maintenance/ && sudo ./update.php --skip-external-dependencies' % site_folder)
    send_file('/etc/nginx/conf.d/edupi.conf', mod='644')

    # restart nginx and php and supervisor
    run('sudo service nginx restart')
    run('sudo service php5-fpm restart')
    run('sudo service supervisor restart')


def deploy_index_page():
    site_folder = '/home/%s/sites/www' % RASP_USER_NAME
    repo_url = 'https://github.com/Orange-Foundation/raspberry-index-page.git'
    # Nginx conf
    send_file('/etc/nginx/sites-enabled/%s' % PORTAL_SITE_NAME, mod='644')

    # create site folder
    run('mkdir -p %s' % site_folder)

    # Get source
    if exists(site_folder + '/.git'):
        run('cd %s && git fetch' % site_folder)
    else:
        run('cd %s && rm -fr *' % site_folder)
        run('git clone %s %s' % (repo_url, site_folder))

    # force to use latest source on the master branch
    run('cd %s && git reset --hard %s' % (site_folder, 'origin/master'))

    # remove default nginx config
    default_nginx_conf_path = '/etc/nginx/sites-enabled/default'
    if exists(default_nginx_conf_path):
        run('sudo rm %s' % default_nginx_conf_path)

    # ugly, need to fix main repo
    send_file('/home/pi/sites/www/index.html', mod='644')

    # restart nginx
    run('sudo service nginx restart')


def _apt_get(package, force=True):
    with settings(warn_only=True):
        force_param = '-y' if force else ''
        run("sudo apt-get install %s %s" % (force_param, package))


def _exec_if_command_not_exists(command, func):
    with settings(warn_only=True):
        ret_code = run("command -v %s > /dev/null 2>&1 && echo $?" % command).strip()
        if ret_code != '0':
            func()


def _install_node_and_npm():
    def func():
        nodejs_path = '/tmp/node_latest_armhf.deb'
        if not exists(nodejs_path):
            run('wget http://node-arm.herokuapp.com/node_latest_armhf.deb --directory-prefix=/tmp/')
        run('sudo dpkg -i %s' % nodejs_path)
        run('curl -L https://www.npmjs.com/install.sh | sudo sh')
    _exec_if_command_not_exists('node', func)


def _install_bower():
    # depends on node
    def func():
        run('sudo npm install -g bower')
    _exec_if_command_not_exists('bower', func)
