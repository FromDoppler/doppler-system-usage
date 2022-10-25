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

environment=""

print_help () {
    echo ""
    echo "Usage: sh decomission.sh [OPTIONS]"
    echo ""
    echo "Remove Lambdas and related infrastructure from AWS"
    echo ""
    echo "Options:"
    echo "  -e, --environment (\"int\"|\"qa\"|\"production\") (mandatory)"
    echo "  -h, --help"
    echo
    echo "Examples:"
    echo "  sh decomission.sh -e=production"
}

# serverless config credentials --provider aws --key YOUR_AWS_ACCESS_KEY --secret YOUR_AWS_SECRET_KEY
# https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/security_credentials

for i in "$@" ; do
case $i in
    -e=*|--environment=*)
    environment="${i#*=}"
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

# Do not stop on error
set +e

serverless remove --stage "${environment}" --config serverless.yml
