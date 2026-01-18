
pipeline {
    agent any
    triggers {
        pollSCM('H/5 * * * *')
    }
    tools {
      nodejs 'NodeJS v22.16.0'
    }
    stages {
        stage("Configure & Install Dependencies") {
            when {
                anyOf {
                    branch 'qa';
                    branch 'uat';
                    branch 'prod';
                }
            }
            steps {
                script {
                    dir(workspace) {
                        sh 'corepack enable'
                        sh 'yarn'
                    }

                    def envName = env.BRANCH_NAME.toLowerCase()
                    def tarName = "MERCK_HCP_${envName}.tar.gz"
                    def targetDir = "/var/www/merck-hcp-${envName}"
                    def nonProdservers  = ['20.185.67.214', '52.170.192.210']
                    def prodservers     = ['20.185.67.214', '52.170.192.210']

                    // Map env to server IPs, domains
                    envServerMap = [
                      qa: nonProdservers,
                      uat: nonProdservers,
                      prod: prodservers
                      ]

                    // Build and package based on env.BRANCH_NAME
                    buildAndPackage = {
                        dir(workspace) {
                            sh "yarn build:${envName}"
                            sh "tar -zcvf ${tarName} -C ./dist/merck-hcp/browser ."
                        }
                    }

                    // Deploy based on env.BRANCH_NAME and envServerMap
                    deployToServers = {
                        def servers = envServerMap[envName] ?: []
                        servers.each { host ->
                            withCredentials([sshUserPrivateKey(credentialsId: 'pharmacord-cdn', keyFileVariable: 'identity', usernameVariable: 'userName')]) {
                                def remote = [:]
                                remote.name = host
                                remote.host = host
                                remote.user = userName
                                remote.identityFile = identity
                                remote.allowAnyHosts = true

                                sshPut remote: remote, from: tarName, into: '/tmp/'
                                sshCommand remote: remote, sudo: true, command: "rm -rfv ${targetDir}/*"
                                sshCommand remote: remote, sudo: true, command: "tar -xf /tmp/${tarName} -C ${targetDir}"
                                sshCommand remote: remote, sudo: true, command: "sudo chown -R www-data ${targetDir}/*"
                                sshCommand remote: remote, sudo: true, command: "rm -rfv /tmp/${tarName}"
                            }
                        }
                    }
                }
            }
        }
        stage('Deploy') {
            when {
                anyOf {
                    branch 'qa';
                    branch 'uat';
                    branch 'prod';
                }
            }
            steps {
                echo " 🚀 Deploying to ${env.BRANCH_NAME.toUpperCase()}"
                script {
                    buildAndPackage()
                    deployToServers()
                }
                echo " 🎉 Successfully deployed to ${env.BRANCH_NAME.toUpperCase()}"
            }
        }
    }
}
