#!/bin/sh

# Stop script on NZEC
set -e
# Stop script if unbound variable found (use ${var:-} if intentional)
set -u

# Lines added to get the script running in the script path shell context
# reference: http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
cd "$(dirname "$0")"

# To avoid issues with MINGW and Git Bash, see:
# https://github.com/docker/toolbox/issues/673
# https://gist.github.com/borekb/cb1536a3685ca6fc0ad9a028e6a959e3
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL="*"

commit=""
environment=""

print_help () {
    echo ""
    echo "Usage: sh build-n-publish.sh [OPTIONS]"
    echo ""
    echo "Use Docker to build project's bundle files and publish Lambdas and"
    echo "related infrastructure to AWS."
    echo ""
    echo "Options:"
    echo "  -e, --environment (\"int\"|\"qa\"|\"production\") (mandatory)"
    echo "  -c, --commit (mandatory)"
    echo "  -h, --help"
    echo
    echo "Examples:"
    echo "  sh build-n-publish.sh.sh -c=aee25c286a7c8265e2b32ccc293f5ab0bd7a9d57 -e=production"
    echo "  sh build-n-publish.sh.sh --commit=aee25c286a7c8265e2b32ccc293f5ab0bd7a9d57 -0-environment=production"
}

# serverless config credentials --provider aws --key YOUR_AWS_ACCESS_KEY --secret YOUR_AWS_SECRET_KEY
# https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/security_credentials

for i in "$@" ; do
case $i in
    -e=*|--environment=*)
    environment="${i#*=}"
    ;;
    -c=*|--commit=*)
    commit="${i#*=}"
    ;;
    -h|--help)
    print_help
    exit 0
    ;;
esac
done

if [ -z "${environment}" ]; then
    echo "Error: environment parameter is mandatory"
    print_help
    exit 1
fi

if [ "${environment}" != "int" ] && [ "${environment}" != "qa" ] && [ "${environment}" != "production" ]; then
    echo "Error: environment parameter value should be int, qa or production"
    print_help
    exit 1
fi

if [ -z "${commit}" ]
then
  echo "Error: commit parameter is mandatory"
  print_help
  exit 1
fi

tag="${environment}-${commit}"

docker build . \
  --tag "${tag}" \
  --build-arg version="${tag}" \

docker run --rm \
  -e AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY \
  "${tag}" \
  /bin/sh -c "\
    sh ci-deploy.sh --environment=${environment} \
    "
