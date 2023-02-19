import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Text, useTheme } from 'react-native-paper';
import { Theme } from '../../providers/ThemeProvider';
import { Message } from '../../types/message';

type ReplyInfoProps = {
  onCloseReply: () => void;
  messageReply?: Message;
};

const ReplyInfo = ({ messageReply, onCloseReply }: ReplyInfoProps) => {
  const theme = useTheme<Theme>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!messageReply) return <></>;

  return (
    <View style={styles.root}>
      <Avatar.Icon icon="reply-outline" size={20} style={styles.icon} />
      <Text style={styles.text} numberOfLines={1}>
        {messageReply.content}
      </Text>
      <IconButton
        icon="close"
        size={20}
        onPress={onCloseReply}
        style={styles.close}
      />
    </View>
  );
};

const createStyles = ({ colors }: Theme) => {
  return StyleSheet.create({
    root: {
      alignItems: 'center',
      flexDirection: 'row',
      margin: 10,
      marginBottom: 0,
      borderRadius: 20,
      backgroundColor: colors.secondaryContainer,
      padding: 10,
    },
    icon: {
      marginRight: 10,
    },
    text: { flex: 1 },
    close: {
      margin: 0,
    },
  });
};

export default ReplyInfo;