import React, { useState, useContext, useEffect } from 'react';
import { ReactComponent as DownChevron } from './../../../../../images/Common/down-chevron.svg';
import {
  chevronIconStyle,
  logCommandBarStyle,
  logExpandButtonStyle,
  logStreamStyle,
  logCommandBarButtonListStyle,
  logCommandBarButtonLabelStyle,
  logCommandBarButtonStyle,
  logEntryDivStyle,
  getLogTextColor,
} from './FunctionLog.styles';
import { useTranslation } from 'react-i18next';
import { Icon } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../../ThemeContext';
import { QuickPulseQueryLayer, SchemaResponseV2, SchemaDocument } from '../../../../../QuickPulseQuery';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { defaultDocumentStreams, defaultClient } from './FunctionLog.constants';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { TextUtilitiesService } from '../../../../../utils/textUtilities';
interface FunctionLogProps {
  toggleExpand: () => void;
  toggleFullscreen: (fullscreen: boolean) => void;
  isExpanded: boolean;
  appInsightsToken?: string;
}

const FunctionLog: React.FC<FunctionLogProps> = props => {
  const { t } = useTranslation();
  const { toggleExpand, isExpanded, toggleFullscreen, appInsightsToken } = props;
  const [maximized, setMaximized] = useState(false);
  const [started, setStarted] = useState(false);
  const [queryLayer, setQueryLayer] = useState<QuickPulseQueryLayer | undefined>(undefined);
  const [logEntries, setLogEntries] = useState<SchemaDocument[]>([]);

  const theme = useContext(ThemeContext);

  const queryAppInsightsAndUpdateLogs = (quickPulseQueryLayer: QuickPulseQueryLayer, token: string) => {
    quickPulseQueryLayer
      .queryDetails(token, false, '')
      .then((dataV2: SchemaResponseV2) => {
        if (dataV2.DataRanges && dataV2.DataRanges[0]) {
          const documents = dataV2.DataRanges[0].Documents;
          if (documents) {
            console.log(documents);
            setLogEntries(documents);
          }
        }
      })
      .catch(error => {
        LogService.error(
          LogCategories.FunctionEdit,
          'getAppInsightsComponentToken',
          `Error when attempting to Query Application Insights: ${error}`
        );
      });
  };

  const disconnectQueryLayer = () => {
    setQueryLayer(undefined);
  };

  const reconnectQueryLayer = () => {
    const newQueryLayer = new QuickPulseQueryLayer(CommonConstants.QuickPulseEndpoints.public, defaultClient);
    newQueryLayer.setConfiguration([], defaultDocumentStreams, []);
    setQueryLayer(newQueryLayer);
  };

  const onExpandClick = () => {
    if (isExpanded && maximized) {
      toggleMaximize();
    }
    toggleExpand();
  };

  const toggleConnection = () => {
    if (started) {
      stopLogs();
    } else {
      startLogs();
    }
  };

  const startLogs = () => {
    if (appInsightsToken) {
      disconnectQueryLayer();
      reconnectQueryLayer();
    } else {
      // todo allisonm: Add messaging for app insights logs
    }
    setStarted(true);
  };

  const stopLogs = () => {
    disconnectQueryLayer();
    setStarted(false);
  };

  const clearLogs = () => {
    setLogEntries([]);
  };

  const copyLogs = () => {
    const logContent = logEntries.join('\n');
    TextUtilitiesService.copyContentToClipboard(logContent);
  };

  const toggleMaximize = () => {
    setMaximized(!maximized);
  };

  useEffect(() => {
    toggleFullscreen(maximized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maximized]);

  useEffect(() => {
    if (appInsightsToken && queryLayer) {
      const timeout = setTimeout(() => queryAppInsightsAndUpdateLogs(queryLayer, appInsightsToken), 2000); // TODO: adjust timeout
      return () => clearInterval(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logEntries, queryLayer, appInsightsToken]);

  return (
    <div>
      <div className={logCommandBarStyle}>
        <span className={logExpandButtonStyle} onClick={onExpandClick}>
          <DownChevron className={chevronIconStyle(isExpanded)} />
          {t('logStreaming_logs')}
        </span>
        {isExpanded && (
          <span className={logCommandBarButtonListStyle}>
            <span onClick={toggleConnection} className={logCommandBarButtonLabelStyle}>
              {started ? (
                <>
                  <Icon iconName="Stop" className={logCommandBarButtonStyle(theme)} />
                  {t('stop')}
                </>
              ) : (
                <>
                  <Icon iconName="TriangleRight12" className={logCommandBarButtonStyle(theme)} />
                  {t('start')}
                </>
              )}
            </span>
            <span onClick={copyLogs} className={logCommandBarButtonLabelStyle}>
              <Icon iconName="Copy" className={logCommandBarButtonStyle(theme)} />
              {t('functionKeys_copy')}
            </span>
            <span onClick={clearLogs} className={logCommandBarButtonLabelStyle}>
              <Icon iconName="CalculatorMultiply" className={logCommandBarButtonStyle(theme)} />
              {t('logStreaming_clear')}
            </span>
            <span onClick={toggleMaximize} className={logCommandBarButtonLabelStyle}>
              {maximized ? (
                <>
                  <Icon iconName="BackToWindow" className={logCommandBarButtonStyle(theme)} />
                  {t('minimize')}
                </>
              ) : (
                <>
                  <Icon iconName="FullScreen" className={logCommandBarButtonStyle(theme)} />
                  {t('maximize')}
                </>
              )}
            </span>
          </span>
        )}
      </div>
      {isExpanded && (
        <div className={logStreamStyle(maximized)}>
          {!!logEntries &&
            logEntries.map((logEntry, logIndex) => {
              return (
                <div
                  key={logIndex}
                  className={logEntryDivStyle}
                  style={{ color: getLogTextColor() }}
                  /*Last Log Entry needs to be scrolled into focus*/
                  ref={el => {
                    if (logIndex + 1 === logEntries.length && !!el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}>
                  {logEntry.Content.Message}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default FunctionLog;