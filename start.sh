dir=`dirname $0`
bower install
node $dir/app.js &
open http://localhost:3344

