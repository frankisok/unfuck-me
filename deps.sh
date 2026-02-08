#/bin/bash

rm yarn.lock

yarn install 

if [ "$?" -ne 0 ]; then
  echo "Error: yarn install exited with error"
  exit 1
fi

cd projects/amp-ng-library
rm yarn.lock
yarn install
if [ "$?" -ne 0 ]; then
  echo "Error: yarn install exited with error"
  exit 1
fi
cd ../..

ng build amp-ng-library
if [ "$?" -ne 0 ]; then
  echo "Error: ng build amp-ng-library exited with error"
  exit 1
fi

echo "success building amp-ng-library and it dependencies"
echo "now run the following command to start the test app: ng serve amp-ng-library-test-app --port 3000"
# ng serve amp-ng-library-test-app --port 3000
