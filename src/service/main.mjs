
import router from './router.mjs';
import '../component/demo-main.mjs';

/** Initializes the main module.
 *
 */
export function initialize() {
    router.initialize();
}

export default { initialize };
