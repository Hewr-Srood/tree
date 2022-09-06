/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useRef, useEffect } from "react";
import { Tree } from "antd";
import "antd/dist/antd.css";

import logs from "./data";
import _ from "lodash";

const App = () => {
  // to prevent componentDidMount render
  const firstRender = useRef(null);

  // this is just an example if we got the spanId 6181df82335332b6 from the params
  const [expandedKeys, setExpandedKeys] = useState(["6181df82335332b6"]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const [tree, setTree] = useState([]);

  const list2tree = (list) => {
    const idToIndex = {};
    _.map(list, (child, i) => {
      idToIndex[child.SpanId] = i;
    });
    let root;

    _.map(list, (el) => {
      const text = el.References[0];
      const indexOfSpanId = text.indexOf("SpanId=") + 7;
      const lastIndexOfSpanId = text.lastIndexOf(",");
      const parentSpanId = text.substring(indexOfSpanId, lastIndexOfSpanId);

      if (parentSpanId === "") {
        root = el;
        return;
      }
      const parentEl = list[idToIndex[parentSpanId]];

      parentEl.children = [...(parentEl.children || []), el];
    });

    setTree([root]);
  };

  useEffect(() => {
    if (!firstRender.current) {
      // format the data
      const formattedData = _.map(logs[0].events, (el) => {
        const formattedEl = { items: null };
        _.map(logs[0].columns, (column, i) => {
          formattedEl[column] = el[i];
        });
        formattedEl["key"] = formattedEl.SpanId;
        return formattedEl;
      });

      // convert the list to tree
      list2tree(formattedData);
      // here we prevent the second rerender of useEffect
      firstRender.current = true;
    }
    // cleanup the ref
    return () => {
      firstRender.current = null;
    };
  }, []);

  return (
    <div>
      {tree.length ? (
        <Tree
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          treeData={tree}
          titleRender={(el) => {
            return (
              <span>
                {el.Name} - {el.SpanId}
              </span>
            );
          }}
        />
      ) : null}
    </div>
  );
};
export default App;
