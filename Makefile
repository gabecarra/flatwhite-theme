VERSION := $(shell node -p "require('./package.json').version")

.PHONY: package publish login tag release clean

## Build a .vsix package without publishing
package:
	vsce package

## Publish the current version to the VS Code Marketplace
publish:
	vsce publish

## Log in to the Marketplace publisher (prompts for a Personal Access Token)
login:
	vsce login gabrielCarraretto

## Tag the current package.json version and push the tag
tag:
	git tag v$(VERSION)
	git push origin v$(VERSION)

## Tag and publish in one step
release: tag publish

## Remove generated .vsix packages
clean:
	rm -f *.vsix
