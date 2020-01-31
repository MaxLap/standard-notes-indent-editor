* Update version in package.json. Commit & push
* On github, release the new version
* In standard notes's extension file:
  * Update the "version"
  * Update the "download_url" with new archive's (from github) path
  * Update the private post to release
* Update the current_release branch with content of master:  
  `git checkout current_release; git reset --hard master; git push; git checkout master`
