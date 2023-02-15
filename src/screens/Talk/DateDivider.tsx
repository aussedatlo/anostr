import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { Theme } from '../../providers/ThemeProvider';
import { Message } from '../../types/message';

type DateDividerProps = {
  message: Message;
  prevMessage: Message;
};

const DateDivider = ({ message, prevMessage }: DateDividerProps) => {
  const theme = useTheme<Theme>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const prevMessageDate = new Date(
    prevMessage?.created_at * 1000,
  ).toLocaleDateString();
  const currMessageDate = new Date(
    message.created_at * 1000,
  ).toLocaleDateString();

  if (prevMessageDate === currMessageDate) return <></>;

  return (
    <View>
      <Divider style={styles.divider} />
      <Text variant="labelSmall" style={styles.date}>
        {currMessageDate}
      </Text>
    </View>
  );
};

const createStyles = ({ colors }: Theme) => {
  return StyleSheet.create({
    divider: {
      marginLeft: 50,
      marginRight: 50,
      marginTop: 10,
    },
    date: {
      alignSelf: 'center',
      marginTop: 5,
      color: colors.onSurfaceDisabled,
    },
  });
};

export default memo(DateDivider);
