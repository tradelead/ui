import { act } from 'react-dom/test-utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mount } from 'enzyme';
import sleep from '../utils/sleep';

async function asyncMountWrapper(component) {
  let wrapper = null;
  await act(async () => {
    wrapper = mount(component);
    await sleep(0);
    wrapper.update();
  });

  return wrapper;
}

export default asyncMountWrapper;
