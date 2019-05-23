import React from 'react';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { mount } from 'enzyme';
import ScoreChart from './ScoreChart';

jest.mock('./LineChart/LineChart', () => (
  props => <div className="test-line-chart">{JSON.stringify(props)}</div>
));

// eslint-disable-next-line react/prop-types
function setup({ trader }) {
  return {
    component: <ScoreChart height={800} width={1920} trader={trader} />,
  };
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let req;
let scoreHistoryListener;

beforeEach(() => {
  req = {
    trader: {
      id: 'trader123',
      observe: sinon.stub(),
    },
  };

  scoreHistoryListener = null;
  req.trader.observe.callsFake((_, listener) => {
    scoreHistoryListener = listener;
    return () => {
    };
  });
});

describe('filters', () => {
  it('fetches score history with duration of 30 by default', async () => {
    const { component } = setup(req);
    mount(component);

    await sleep(0);

    sinon.assert.calledWith(req.trader.observe, [{
      key: 'scores',
      duration: 30,
    }], sinon.match.func);
  });

  it('fetches score history with duration of 1 when "today" filter clicked', async () => {
    const { component } = setup(req);
    const el = mount(component);
    req.trader.observe.reset();
    el.find('.Today').simulate('click');

    await sleep(0);

    sinon.assert.calledWith(req.trader.observe, [{
      key: 'scores',
      duration: 1,
    }], sinon.match.func);
  });

  it('fetches score history with duration of 1 when "week" filter clicked', async () => {
    const { component } = setup(req);
    const el = mount(component);
    req.trader.observe.reset();
    el.find('.Week').simulate('click');

    await sleep(0);

    sinon.assert.calledWith(req.trader.observe, [{
      key: 'scores',
      duration: 7,
    }], sinon.match.func);
  });

  it('fetches score history with duration of 30 when "month" filter clicked', async () => {
    const { component } = setup(req);
    const el = mount(component);
    el.find('.Week').simulate('click');
    req.trader.observe.reset();
    el.find('.Month').simulate('click');

    await sleep(0);

    sinon.assert.calledWith(req.trader.observe, [{
      key: 'scores',
      duration: 30,
    }], sinon.match.func);
  });

  it('fetches score history with duration of 0 when "all" filter clicked', async () => {
    const { component } = setup(req);
    const el = mount(component);
    req.trader.observe.reset();
    el.find('.All').simulate('click');

    await sleep(0);

    sinon.assert.calledWith(req.trader.observe, [{
      key: 'scores',
      duration: 0,
    }], sinon.match.func);
  });
});

describe('chart data', () => {
  let wrapper;

  beforeEach(async () => {
    const { component } = setup(req);
    wrapper = mount(component);

    await sleep(0);

    act(() => {
      scoreHistoryListener([
        { time: 100, score: 1 },
        { time: 200, score: 2 },
        { time: 300, score: 3 },
      ]);
    });
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
    act(() => {
      scoreHistoryListener([
        { time: 100, score: 1 },
        { time: 200, score: 2 },
        { time: (2 * 24 * 60 * 60 * 1000) + 100, score: 3 },
      ]);
    });

    await sleep(0);
    wrapper.update();

    expect(wrapper.find('.daily-avg .value')).toExist();
    expect(wrapper.find('.daily-avg .value').text()).toEqual('100.0%');
  });

  it('passes score data to LineChart', async () => {
    const expectedChartData = [
      { time: 100, value: 1, date: new Date(100).toISOString(), dateFormatted: 'Dec 31 @ 07 PM' },
      { time: 200, value: 2, date: new Date(200).toISOString(), dateFormatted: 'Dec 31 @ 07 PM' },
      { time: 300, value: 3, date: new Date(300).toISOString(), dateFormatted: 'Dec 31 @ 07 PM' },
    ];

    expect(wrapper.find('.test-line-chart')).toExist();
    // this is a hack because shallow rendering isn't supported in hooks yet.
    expect(JSON.parse(wrapper.find('.test-line-chart').text())).toHaveProperty('data', expectedChartData);
  });
});
