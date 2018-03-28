#!/bin/bash

cd /tmp
rm -rf monday
mkdir monday
cd monday

git clone ssh://gitathome/magnus/installer
git clone ssh://gitathome/magnus/node_image
git clone ssh://gitathome/magnus/my-lodash
git clone ssh://gitathome/magnus/proto-magnus.anderssen.ch
git clone ssh://gitathome/magnus/proxy
git clone ssh://gitathome/magnus/scripts
git clone ssh://gitathome/magnus/seo_poc
git clone ssh://gitathome/magnus/skeleton
git clone ssh://gitathome/magnus/test
git clone ssh://gitathome/magnus/test1
git clone ssh://gitathome/magnus/test2
git clone ssh://gitathome/magnus/typescript-skeleton
git clone ssh://gitathome/magnus/ui
git clone ssh://gitathome/magnus/ui_test
git clone ssh://gitathome/magnus/varnish_playground


# adding a second repo
cd proto-magnus.anderssen.ch
git remote add other ssh://callmemagnus@bitbucket.org/callmemagnus/magnus.anderssen.ch
cd ..

# modify a file
cd proxy
echo "test" >  test.txt
cd ..
