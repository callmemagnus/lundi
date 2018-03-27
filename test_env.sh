#!/bin/bash

cd /tmp
rm -rf monday
mkdir monday
cd monday

#git clone ssh://gitathome/magnus/installer
#git clone ssh://gitathome/magnus/node_image
git clone ssh://gitathome/magnus/magnus.anderssen.ch

cd magnus.anderssen.ch
git remote add other ssh://callmemagnus@bitbucket.org/callmemagnus/magnus.anderssen.ch

ls -la
