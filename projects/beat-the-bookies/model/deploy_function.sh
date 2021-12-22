pipenv run pip freeze > requirements.txt
gcloud functions deploy beat-the-bookies-model \
--runtime python39 \
--trigger-resource betting-algorithms \
--trigger-event google.storage.object.finalize