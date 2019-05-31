import React from 'react';
import sinon from 'sinon';
import { act } from 'react-dom/test-utils';
import sleep from '../../../utils/sleep';
import asyncMountWrapper from '../../../testUtils/asyncMountWrapper';
import asyncUpdateWrapper from '../../../testUtils/asyncUpdateWrapper';
import AppContext from '../../../AppContext';
import MockFile from './MockFile';
import ProfileSettings from './ProfileSettings';

jest.mock('../../TraderImg/TraderImg', () => (
  // eslint-disable-next-line func-names
  function MockTraderImg() {
    return <div />;
  }
));

let ctx = {};
let props = {};

beforeEach(() => {
  ctx = {
    user: {
      id: 'trader123',
      username: 'tradername',
    },
  };

  props = {
    profile: {
      data: {
        username: 'tradernameTest',
        website: 'http://test.com',
        bio: 'testing bio',
        profilePhoto: {
          url: 'http://test.com/image.jpg',
        },
      },
      loading: false,
      errors: undefined,
    },
    update: sinon.stub(),
    updateRes: {
      loading: false,
      errors: undefined,
    },
    uploadProfilePhoto: sinon.stub(),
  };
});

function setup() {
  return (
    <AppContext.Provider value={ctx}><ProfileSettings {...props} /></AppContext.Provider>
  );
}

describe('show profile info', () => {
  let wrapper;

  beforeEach(async () => {
    const component = setup();
    wrapper = await asyncMountWrapper(component);
  });

  it('shows bio', async () => {
    expect(wrapper.find('.bio textarea').text())
      .toEqual('testing bio');
  });

  it('shows website', async () => {
    expect(wrapper.find('.website input').prop('value'))
      .toEqual('http://test.com');
  });

  it('calls TraderImg with profilePhoto src and username as alt', () => {
    const traderImgWrap = wrapper.find('MockTraderImg');
    expect(traderImgWrap).toHaveProp('src', 'http://test.com/image.jpg');
    expect(traderImgWrap).toHaveProp('alt', 'tradernameTest');
  });
});

describe('save profile info', () => {
  it('shows loader while saving', async () => {
    props.updateRes.loading = true;

    const component = setup();
    const wrapper = await asyncMountWrapper(component);

    expect(wrapper.find('.save').find('Button').find('Spinner')).toExist();
  });

  it('hides loader after saving', async () => {
    props.updateRes.loading = false;

    const component = setup();
    const wrapper = await asyncMountWrapper(component);

    expect(wrapper.find('.save').find('Button').find('Spinner')).toHaveLength(0);
  });

  it('shows error if request rejects', async () => {
    props.updateRes.errors = [
      { message: 'test error 1' },
      { message: 'test error 2' },
    ];

    const component = setup();
    const wrapper = await asyncMountWrapper(component);

    expect(wrapper.find('div.save-error').at(0).text()).toContain('test error 1');
    expect(wrapper.find('div.save-error').at(1).text()).toContain('test error 2');
  });

  describe('saves profile', () => {
    test('when form submitted', async () => {
      const component = setup();
      const wrapper = await asyncMountWrapper(component);

      wrapper.find('.bio textarea')
        .simulate('change', { target: { value: 'new bio' } });

      wrapper.find('.website input')
        .simulate('change', { target: { value: 'http://newurl.com' } });

      await act(async () => {
        wrapper.find('Form').simulate('submit');
        await sleep(0);
        wrapper.update();
      });

      sinon.assert.calledWith(props.update, {
        bio: 'new bio',
        website: 'http://newurl.com',
      });
    });

    test('when button clicked', async () => {
      const component = setup();
      const wrapper = await asyncMountWrapper(component);

      wrapper.find('.bio textarea')
        .simulate('change', { target: { value: 'new bio' } });

      wrapper.find('.website input')
        .simulate('change', { target: { value: 'http://newurl.com' } });

      await act(async () => {
        wrapper.find('.save').find('Button').simulate('click');
        await sleep(0);
        wrapper.update();
      });

      sinon.assert.calledWith(props.update, {
        bio: 'new bio',
        website: 'http://newurl.com',
      });
    });
  });
});

describe('upload profile photo', () => {
  const simulateUpload = async (err) => {
    if (!err) {
      props.uploadProfilePhoto.callsFake(async ({ progressFn }) => {
        for (let i = 0; i < 50; i += 1) {
          await sleep(1);
          progressFn(i * 2);
        }

        return true;
      });
    } else {
      props.uploadProfilePhoto.rejects(err);
    }

    const size = 1024 * 1024 * 2;
    const mock = new MockFile();
    const file = mock.create('pic.jpg', size, 'image/jpeg');

    const component = setup();
    const wrapper = await asyncMountWrapper(component);

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
    sinon.assert.calledWith(props.uploadProfilePhoto, {
      file,
      progressFn: sinon.match.any,
    });
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
