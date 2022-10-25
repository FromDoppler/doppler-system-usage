pipeline {
    agent any
    stages {
        stage('Verify git commit conventions') {
            when {
                not {
                    branch 'INT'
                }
            }
            steps {
                sh 'sh ./gitlint.sh'
            }
        }
        stage('Verify Dockerfile') {
            steps {
                sh 'sh ./dockerlint.sh'
            }
        }
        stage('Verify .sh files') {
            steps {
                sh 'docker build --target verify-sh .'
            }
        }
        stage('Restore') {
            steps {
                sh 'docker build --target restore .'
            }
        }
        stage('Verify Format') {
            steps {
                sh 'docker build --target verify-format .'
            }
        }
        stage('Test') {
            steps {
                sh 'docker build --target test .'
            }
        }
        stage('Publish to AWS') {
            environment {
                AWS_ACCESS_KEY_ID = credentials('aws-doppler-fun-jenkins-cicd-id')
                AWS_SECRET_ACCESS_KEY = credentials('aws-doppler-fun-jenkins-cicd-key')
            }
            stages {
                stage('Publish pre-release packages from main') {
                    when {
                        branch 'main'
                    }
                    steps {
                        sh '''
                          sh build-n-publish.sh \
                            --commit=${GIT_COMMIT} \
                            --environment=qa
                          '''
                    }
                }
                stage('Publish pre-release packages from INT') {
                    when {
                        branch 'INT'
                    }
                    steps {
                        sh '''
                          sh build-n-publish.sh \
                            --commit=${GIT_COMMIT} \
                            --environment=int
                          '''
                    }
                }
                stage('Publish final version images') {
                    when {
                        expression {
                            return isVersionTag(readCurrentTag())
                        }
                    }
                    steps {
                        sh '''
                          sh build-n-publish.sh \
                            --commit=${GIT_COMMIT} \
                            --environment=production
                          '''
                    }
                }
            }
        }
    }
}

def boolean isVersionTag(String tag) {
    echo "checking version tag $tag"

    if (tag == null) {
        return false
    }

    // use your preferred pattern
    def tagMatcher = tag =~ /v\d+\.\d+\.\d+/

    return tagMatcher.matches()
}

def CHANGE_ID = env.CHANGE_ID

// https://stackoverflow.com/questions/56030364/buildingtag-always-returns-false
// workaround https://issues  .jenkins-ci.org/browse/JENKINS-55987
// TODO: read this value from Jenkins provided metadata
def String readCurrentTag() {
    return sh(returnStdout: true, script: 'echo ${TAG_NAME}').trim()
}
