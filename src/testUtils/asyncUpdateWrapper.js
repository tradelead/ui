import { act } from 'react-dom/test-utils';
import sleep from '../utils/sleep';

async function asyncUpdateWrapper(wrapper) {
  await act(async () => {
    await sleep(0);
    wrapper.update();
  });
}

export default asyncUpdateWrapper;
