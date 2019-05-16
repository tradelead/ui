import React, {
  useState,
  useEffect,
  cloneElement,
  Children,
} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export const ColumnsToTabs = ({ children, tabBreakpoint }) => {
  const [activeTab, setActiveTab] = useState(Children.toArray(children)[0]);
  const tabbed = useMediaQuery(`(max-width: ${tabBreakpoint}px)`);

  const tabsNav = Children.map(children, child => ({
    label: child.props.label,
    showTab: () => { setActiveTab(child); },
  }));

  const childrenWithProps = Children.map(children, child => cloneElement(child, {
    tabbed,
    tabActive: activeTab.props && child.props.label === activeTab.props.label,
  }));

  return (
    <div className={`columns-to-tabs-wrap ${(tabbed) ? 'tabs' : 'columns'}`}>
      {tabbed && (
        <div className="tab-navigation">
          {tabsNav.map(({ label, showTab }) => (
            <button type="button" onClick={showTab}>{label}</button>
          ))}
        </div>
      )}

      <Row>
        {childrenWithProps}
      </Row>
    </div>
  );
};

export const ColumnTab = ({ children, label, columnClassName, tabbed, tabActive }) => {
  const columnClass = !tabbed ? columnClassName : '';
  const tabActiveClass = (tabbed && tabActive) ? 'active' : '';

  return (
    <Col className={`column-tab ${columnClass} ${tabActiveClass}`}>
      {!tabbed && (<h2>{label}</h2>)}

      <div className="column-inner">
        {children}
      </div>
    </Col>
  );
};

function useMediaQuery(mediaQuery) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const checkMediaQuery = () => {
      setActive(window.matchMedia(mediaQuery).matches);
    };

    checkMediaQuery();
    window.addEventListener('resize', checkMediaQuery);
    return () => window.removeEventListener('resize', checkMediaQuery);
  }, [mediaQuery]);

  return active;
}
