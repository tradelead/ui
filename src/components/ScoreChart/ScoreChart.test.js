import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import ScoreChart from './ScoreChart';
import sleep from '../../utils/sleep';
import asyncMountWrapper from '../../testUtils/asyncMountWrapper';

jest.mock('./LineChart/LineChart', () => (
  // eslint-disable-next-line func-names
  function MockLineChart() {
    return <div />;
  }
));

// eslint-disable-next-line react/prop-types
function setup(req) {
  return {
    component: <ScoreChart {...req} />,
  };
}

let req;

beforeEach(() => {
  req = {
    height: 800,
    width: 1920,
    loading: false,
    scoreHistory: [],
    setDuration: sinon.stub(),
  };
});

describe('filters', () => {
  it('fetches score history with duration of 1 when "today" filter clicked', async () => {
    const { component } = setup(req);
    const el = mount(component);
    req.setDuration.reset();
    el.find('.Today').simulate('click');

    await sleep(0);

    sinon.assert.calledWith(req.setDuration, 1);
  });

  it('fetches score history with duration of 1 when "week" filter clicked', async () => {
    const { component } = setup(req);
    const el = mount(component);
    req.setDuration.reset();
    el.find('.Week').simulate('click');

    await sleep(0);

    sinon.assert.calledWith(req.setDuration, 7);
  });

  it('fetches score history with duration of 30 when "month" filter clicked', async () => {
    const { component } = setup(req);
    const el = mount(component);
    el.find('.Week').simulate('click');
    req.setDuration.reset();
    el.find('.Month').simulate('click');

    await sleep(0);

    sinon.assert.calledWith(req.setDuration, 30);
  });

  it('fetches score history with duration of 0 when "all" filter clicked', async () => {
    const { component } = setup(req);
    const el = mount(component);
    req.setDuration.reset();
    el.find('.All').simulate('click');

    await sleep(0);

    sinon.assert.calledWith(req.setDuration, 0);
  });
});

describe('chart data', () => {
  let wrapper;

  beforeEach(async () => {
    req.scoreHistory = [
      { time: 100, score: 1 },
      { time: 200, score: 2 },
      { time: 300, score: 3 },
    ];

    const { component } = setup(req);
    wrapper = await asyncMountWrapper(component);
  });

  it('sets growth as percentage different between first and last scores', async () => {
    expect(wrapper.find('.growth .value')).toExist();
    expect(wrapper.find('.growth .value').text()).toEqual('200.0%');
  });

  it('sets growth as percentage different between first and last scores with 1 day minimum', async () => {
    expect(wrapper.find('.daily-avg .value')).toExist();
    expect(wrapper.find('.daily-avg .value').text()).toEqual('200.0%');
  });

  it('sets growth as percentage different between first and last scores when 2 days', async () => {
    req.scoreHistory = [
      { time: 100, score: 1 },
      { time: 200, score: 2 },
      { time: (2 * 24 * 60 * 60 * 1000) + 100, score: 3 },
    ];

    const { component } = setup(req);
    wrapper = await asyncMountWrapper(component);

    expect(wrapper.find('.daily-avg .value')).toExist();
    expect(wrapper.find('.daily-avg .value').text()).toEqual('100.0%');
  });

  it('passes score data to LineChart', async () => {
    const expectedChartData = [
      {
        time: 100,
        value: 1,
        date: new Date(100),
        dateFormatted: 'Dec 31 @ 07 PM',
      },
      {
        time: 200,
        value: 2,
        date: new Date(200),
        dateFormatted: 'Dec 31 @ 07 PM',
      },
      {
        time: 300,
        value: 3,
        date: new Date(300),
        dateFormatted: 'Dec 31 @ 07 PM',
      },
    ];

    console.log(wrapper.find('MockLineChart').debug());
    expect(wrapper.find('MockLineChart')).toExist();
    expect(wrapper.find('MockLineChart').prop('data')).toEqual(expectedChartData);
  });
});

it('shows loading icon', async () => {
  req.loading = true;
  const { component } = setup(req);
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('Spinner')).toExist();
});
