import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Avatar from './Avatar';

interface AuthorRowProps {
    fullName: string;
    linkText: string;
    onPress: () => void;
}

export default function AuthorRow({ fullName, linkText, onPress }: AuthorRowProps) {
    return (
        <View style={styles.container}>
            <Avatar
                size={35}
                initials={fullName}
                backgroundColor={'red'}
            />
            <Text style={styles.text} numberOfLines={1}>
                {fullName}
            </Text>
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.link}>{linkText}</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    text: {
        // flex: 1,
        marginHorizontal: 6,
        color: 'green',
        backgroundColor: 'yellow'
    },
    link: { color: 'blue' },
});