# gp stack ...
gp stack fix # rebases git branches to match stack
gp stack onto # move stack onto some other branch
gp stack regen # create stacks based on the git branches.
gp stack submit # create pr's / force pushes for full stack
gp stack land # attempt to land full stack
gp stack clean # delete branches in the stack which have been merged into stack trunk
gp stack fetch # pull changes to pull request and store in stack metadata, such as titles


# gp upstack...
# gp upstack fix # rebases git branches to match upstack inclusive
gp upstack onto # move upstack inclusive onto some other branch
# gp upstack submit # create pr's / force pushes for full stack
# gp upstack land # attempt to land full stack
# gp upstack clean # delete branches in the stack which have been merged into stack trunk
# gp upstack fetch # pull changes to pull request and store in stack metadata, such as titles


# gp downstack...
# gp downstack fix # rebases git branches to match stack
# gp downstack onto # move stack onto some other branch
gp downstack submit # create pr's / force pushes for full stack
gp downstack land # attempt to land full stack
# gp downstack clean # delete branches in the stack which have been merged into stack trunk
# gp downstack fetch # pull changes to pull request and store in stack metadata, such as titles


# gp branch ...
gp branch create <name> # Create new stacked branch, commit staged changes changes
gp branch amend # Commit staged changes on top of current branch, fix upstack
gp branch land # If possible, land branch, clean stack, and fix upstack
gp branch submit # Create PR / force push current branch
gp branch next # Traverse upstack by one branch
gp branch prev # Traverse downstack by one branch
gp branch top # Traverse upstack fully
gp branch bottom # Traverse downstack fully
gp branch help # Traverse downstack fully
gp branch = gp branch log # Traverse downstack fully


# gp userconfig...
gp userconfig auth # Opens website, fetches token, prompts user to paste in token

# gp repoconfig...
gp repoconfig # print repo config
gp repoconfig --get-owner # print key value
gp repoconfig --set-owner=<value> # set key values
gp repoconfig --set-trunk=<value>
gp repoconfig --set-origin=<value>
