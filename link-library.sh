

if [[ -d "AMPNGLibrary" ]]; then
    echo "*****Removing the AMPNGLibrary directory*****"
    rm -rf AMPNGLibrary
fi

git clone git@Bungan.local:atmosphere/AMPServer/WebFrameworks/AMPNGLibrary.git
if [[ $? != 0 ]]; then
    echo "Error: Could not clone the AMPNGLibrary"
    exit 1
fi
echo "/AMPNGLibrary/" >> .gitignore

cd AMPNGLibrary
yarn add ng-packagr
if [[ $? != 0 ]]; then
    echo "Error: Could not install ng-packagr"
    exit 1
fi

yarn install
if [[ $? != 0 ]]; then
    echo "Error: Could not install the AMPNGLibrary dependencies"
    exit 1
fi

ng build amp-ng-library --configuration production
if [[ $? != 0 ]]; then
    echo "Error: Could not build the AMPNGLibrary"
    exit 1
fi