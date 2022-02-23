
import '../component/demo-main.mjs'; // need to get the main component code loaded
import router from './router.mjs';
import translator from './translator.mjs';


export function initialize() {
    router.initialize();
    translator.initialize();
}
