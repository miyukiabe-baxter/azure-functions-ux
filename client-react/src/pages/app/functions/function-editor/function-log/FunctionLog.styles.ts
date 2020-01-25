import { style } from 'typestyle';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';

export const chevronIconStyle = (expand?: boolean) =>
  style({
    width: '13px',
    height: '8px',
    marginRight: '9px',
    transform: expand ? 'rotate(180deg)' : '',
  });

export const logCommandBarStyle = style({
  height: '37px',
  display: 'flex',
  alignItems: 'center',
  marginLeft: '10px',
  justifyContent: 'space-between',
});

export const logExpandButtonStyle = style({
  cursor: 'pointer',
});

export const logStreamStyle = (maximized: boolean) =>
  style({
    height: maximized ? 'calc(100vh - 124px)' : '175px',
    backgroundColor: '#000000',
    overflow: 'auto',
    padding: '20px',
  });

export const logCommandBarButton = style({
  marginTop: '5px',
  paddingRight: '5px',
});

export const logCommandBarButtonListStyle = style({
  float: 'right',
});

export const logCommandBarButtonLabelStyle = style({
  marginRight: '16px',
  cursor: 'pointer',
});

export const logCommandBarButtonStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.primaryButtonBackground,
    paddingRight: '5px',
  });

export const logEntryDivStyle = style({
  whiteSpace: 'pre-wrap',
  paddingBottom: '5px',
});

export function getLogTextColor(): string {
  return '#ff6161';
}