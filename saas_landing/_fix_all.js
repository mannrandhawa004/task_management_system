const fs = require('fs');

// 1. Fix checkout.js so declarations use `var` instead of `let` to prevent duplicate declaration syntax errors across script files
let checkoutJs = fs.readFileSync('saas_landing/js/checkout.js', 'utf8');
checkoutJs = checkoutJs.replace(/let\s+currentPlan\s*=/g, 'var currentPlan =');
checkoutJs = checkoutJs.replace(/let\s+isAnnual\s*=/g, 'var isAnnual =');
checkoutJs = checkoutJs.replace(/let\s+provisionedData\s*=/g, 'var provisionedData =');
fs.writeFileSync('saas_landing/js/checkout.js', checkoutJs);
console.log('Fixed checkout.js declarations (let -> var)');

// 2. Fix index.html
let html = fs.readFileSync('saas_landing/index.html', 'utf8');

// Replace duplicate `let isAnnual = true;` in index.html with `var isAnnual = true;` or safely check
html = html.replace(/let\s+isAnnual\s*=\s*true;/g, 'var isAnnual = true;');
html = html.replace(/let\s+currentPlan\s*=/g, 'var currentPlan =');

// Replace the 4 remaining broken showcase_*.png references in the industry grid
html = html.replace(
  /<img src="assets\/showcase_projects\.png"([^>]*)>/g,
  '<img src="assets/light_task_board.png"$1 class="block dark:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" /><img src="assets/dark_task_board.png"$1 class="hidden dark:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />'
);

html = html.replace(
  /<img src="assets\/showcase_attendance\.png"([^>]*)>/g,
  '<img src="assets/light_attendence.png"$1 class="block dark:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" /><img src="assets/dark_attendence.png"$1 class="hidden dark:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />'
);

html = html.replace(
  /<img src="assets\/showcase_dashboard\.png"([^>]*)>/g,
  '<img src="assets/light_dashboard.png"$1 class="block dark:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" /><img src="assets/dark_dashboard.png"$1 class="hidden dark:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />'
);

html = html.replace(
  /<img src="assets\/showcase_employees\.png"([^>]*)>/g,
  '<img src="assets/light_employees.png"$1 class="block dark:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" /><img src="assets/dark_all_user.png"$1 class="hidden dark:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />'
);

fs.writeFileSync('saas_landing/index.html', html);
console.log('Fixed index.html syntax error and 404 showcase images!');
