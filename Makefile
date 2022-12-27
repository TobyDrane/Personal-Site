python-setup:
	pyenv install --skip-existing 3.8.12
	echo 'eval "$(pyenv init --path)"' >> ~/.bashrc
	pyenv local 3.8.12

reqs:
	pip install -r requirements.txt 

venv:
	pyenv exec python -m venv .venv  && \
	source .venv/bin/activate && \
	make reqs
	@echo "========================"
	@echo "Virtual environment successfully created. To activate the venv:" 
	@echo "	\033[0;32msource .venv/bin/activate"

setup:
	npm install --legacy-peer-deps
	make python-setup
	make venv

develop:
	npm run develop 

clean:
	npm run clean

build/site:
	npm run build

build/blogs:
	node ./scripts/convert-blogs.js
	node ./scripts/upload-blogs.js
