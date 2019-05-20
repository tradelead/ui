import React from 'react';
import sinon from 'sinon';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import AppContext from '../../../AppContext';
import MockFile from './MockFile';
import ProfileSettings from './ProfileSettings';

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));

const ctx = {
  trader: {
    get: sinon.stub(),
    update: sinon.stub(),
    upload: sinon.stub(),
  },
};

function setup() {
  return (
    <AppContext.Provider value={ctx}><ProfileSettings /></AppContext.Provider>
  );
}

describe('show current profile info', () => {
  let wrapper;

  beforeAll(async () => {
    ctx.trader.get.withArgs(['bio'], false).resolves({ bio: 'my bio' });

    const component = setup();
    wrapper = await asyncMount(component);
  });

  it('shows bio', () => {
    expect(wrapper.find('.bio textarea').text()).toEqual('my bio');
  });

  it('calls TraderImg with trader and size thumbnail', () => {
    const traderImgWrap = wrapper.find('.profilePhoto').find('TraderImg');
    expect(traderImgWrap).toHaveProp('trader', ctx.trader);
    expect(traderImgWrap).toHaveProp('size', 'thumbnail');
    expect(traderImgWrap).toHaveProp('className', 'profilePhotoImg');
  });
});

describe('save profile info', () => {
  it('shows loader while saving', async () => {
    ctx.trader.update.returns(sleep(100));

    const component = setup();
    const wrapper = await asyncMount(component);

    wrapper.find('.bio textarea')
      .simulate('change', { target: { value: 'new bio' } });

    wrapper.find('Form').simulate('submit');

    await act(async () => {
      wrapper.find('Form').simulate('submit');
      await sleep(0);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('.save').find('Button').find('Spinner')).toExist();
  });

  it('hides loader after saving', async () => {
    ctx.trader.update.returns(sleep(0));

    const component = setup();
    const wrapper = await asyncMount(component);

    wrapper.find('.bio textarea')
      .simulate('change', { target: { value: 'new bio' } });

    await act(async () => {
      wrapper.find('Form').simulate('submit');
      await sleep(0);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('.save').find('Button').find('Spinner')).toHaveLength(0);
  });

  it('shows error if request rejects', async () => {
    const error = 'this is my error';
    ctx.trader.update.rejects(new Error(error));

    const component = setup();
    const wrapper = await asyncMount(component);

    wrapper.find('.bio textarea')
      .simulate('change', { target: { value: 'new bio' } });

    await act(async () => {
      wrapper.find('Form').simulate('submit');
      await sleep(0);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('div.save-error').text()).toContain(error);
  });

  describe('saves bio', () => {
    test('when form submitted', async () => {
      const component = setup();
      const wrapper = await asyncMount(component);

      wrapper.find('.bio textarea')
        .simulate('change', { target: { value: 'new bio' } });

      await act(async () => {
        wrapper.find('Form').simulate('submit');
        await sleep(0);
        wrapper.update();
        await sleep(0);
      });

      sinon.assert.calledWith(ctx.trader.update, { bio: 'new bio' });
    });

    test('when button clicked', async () => {
      const component = setup();
      const wrapper = await asyncMount(component);

      wrapper.find('.bio textarea')
        .simulate('change', { target: { value: 'new bio' } });

      await act(async () => {
        wrapper.find('.save').find('Button').simulate('click');
        await sleep(0);
        wrapper.update();
        await sleep(0);
      });

      sinon.assert.calledWith(ctx.trader.update, { bio: 'new bio' });
    });
  });
});

describe('upload profile photo', () => {
  const simulateUpload = async (err) => {
    if (!err) {
      ctx.trader.upload.callsFake(async (data, progressFn) => {
        for (let i = 0; i < 50; i += 1) {
          await sleep(1);
          progressFn(i * 2);
        }

        return true;
      });
    } else {
      ctx.trader.upload.rejects(err);
    }

    const size = 1024 * 1024 * 2;
    const mock = new MockFile();
    const file = mock.create('pic.jpg', size, 'image/jpeg');

    const component = setup();
    const wrapper = await asyncMount(component);

    await act(async () => {
      wrapper.find('.profilePhoto input.file-upload').simulate('change', {
        target: {
          files: [file],
        },
      });
      await sleep(0);
      wrapper.update();
      await sleep(0);
    });

    return { wrapper, file };
  };

  it('calls upload with file', async () => {
    const { file } = await simulateUpload();
    sinon.assert.calledWith(ctx.trader.upload, {
      key: 'profilePhoto',
      file,
    }, sinon.match.any);
  });

  it('hides file upload while uploading', async () => {
    const { wrapper } = await simulateUpload();

    await act(async () => {
      await sleep(0);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('input.file-upload')).toHaveLength(0);
  });

  it('updates progress bar', async () => {
    const { wrapper } = await simulateUpload();

    await act(async () => {
      await sleep(10);
      wrapper.update();
      await sleep(0);
    });

    const { width } = wrapper.find('.progressBar').prop('style');
    const progress = Math.trunc(width.substr(0, width.length - 1));
    expect(progress).toBeGreaterThanOrEqual(1);
  });

  it('hides progress bar after complete', async () => {
    const { wrapper } = await simulateUpload();

    await act(async () => {
      await sleep(300);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('ProgressBar')).toHaveLength(0);
  });

  it('shows file upload after complete', async () => {
    const { wrapper } = await simulateUpload();

    await act(async () => {
      await sleep(300);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('input.file-upload')).toHaveLength(1);
  });

  it('shows error if fails', async () => {
    const errMsg = 'This is my error';
    const { wrapper } = await simulateUpload(new Error(errMsg));

    await act(async () => {
      await sleep(300);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('.file-upload-wrap').text()).toContain(errMsg);
  });
});


async function asyncMount(component) {
  const wrapper = mount(component);

  await act(async () => {
    await sleep(0);
  });

  return wrapper;
}
