import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

interface AvatarProps {
    size: number;
    backgroundColor: string;
    initials: string;
}

export default class Avatar extends React.Component<AvatarProps> {
    private static getInitials(name: string): string {
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word[0].toUpperCase())
            .join('');
    }

    override render() {
        const { size, backgroundColor, initials } = this.props;
        const style = {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
        };
        return (
            <View style={[styles.container, style]}>
                <Text style={[styles.text, { fontSize: size * 0.4 }]}>
                    {Avatar.getInitials(initials)}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontWeight: '600',
    },
});
