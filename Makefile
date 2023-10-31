dev:
	deno run --allow-net --allow-read index.js

raw_test:
	deno test --parallel --allow-net --coverage=cov_profile
	deno coverage cov_profile --lcov --output=cov_profile.lcov

test: raw_test
	genhtml -o cov_profile/html cov_profile.lcov
	open cov_profile/html/index.html
