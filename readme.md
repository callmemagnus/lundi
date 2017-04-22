# lundi

Aim of this module is to reinstall your dev environment every monday morning.

`Lundi` is french for monday, the day you should re-install your env.

Nowadays, we usually have several git repos to work on or with at the same time. Sometimes you reach a point where everything works but only on one's machine. This is usually because of dirty environment that has not been updated regularly.

## installation

```shell
$ npm i lundi -g
```

## What does it do ?

In a folder containing some git repositories

```bash
$ lundi --init
```

This will create a configuration file with the collected information about your git repositories.

If the config file exists, lundi will check if the repos have pending work and if not, it will delete the repos and clone them again.

By default, it tries at configuration generation to "guess" the type of project (by checking the presence of `package.json` or `pom.xml`).

You may edit the configuration fil in order to perform custom operations after cloning.

### Disclaimer

Please take care when using this mondule. Testing command on the system is -shitty- hard.
