'use client';

import { Button, Input, Select, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface ChatMessagesEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// Format: ["|-1|Message 1", "|-2|Message 2"]
// -1 = boss nói, -2 = player nói
export default function ChatMessagesEditor({ value, onChange, placeholder }: ChatMessagesEditorProps) {
    const parseMessages = (): { type: string; text: string }[] => {
        try {
            const arr = JSON.parse(value);
            if (!Array.isArray(arr)) return [];
            return arr.map((msg: string) => {
                const match = msg.match(/^\|(-?\d+)\|(.*)$/);
                if (match) {
                    return { type: match[1], text: match[2] };
                }
                return { type: '-1', text: msg };
            });
        } catch {
            return [];
        }
    };

    const messages = parseMessages();

    const updateMessages = (newMessages: { type: string; text: string }[]) => {
        const formatted = newMessages.map(m => `|${m.type}|${m.text}`);
        onChange(JSON.stringify(formatted));
    };

    const addMessage = () => {
        updateMessages([...messages, { type: '-1', text: '' }]);
    };

    const removeMessage = (index: number) => {
        updateMessages(messages.filter((_, i) => i !== index));
    };

    const updateMessage = (index: number, field: 'type' | 'text', val: string) => {
        const newMessages = [...messages];
        newMessages[index] = { ...newMessages[index], [field]: val };
        updateMessages(newMessages);
    };

    return (
        <div className="space-y-2">
            {messages.map((msg, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Select
                        value={msg.type}
                        onChange={(val) => updateMessage(index, 'type', val)}
                        style={{ width: 120 }}
                        size="small"
                        options={[
                            { value: '-1', label: 'Boss nói' },
                            { value: '-2', label: 'Player nói' },
                        ]}
                    />
                    <Input
                        value={msg.text}
                        onChange={(e) => updateMessage(index, 'text', e.target.value)}
                        placeholder={placeholder || "Nhập nội dung chat..."}
                        size="small"
                        style={{ flex: 1 }}
                    />
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeMessage(index)}
                    />
                </div>
            ))}
            <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={addMessage}
            >
                Thêm chat
            </Button>
            {messages.length > 0 && (
                <div className="text-xs text-gray-400 mt-1">
                    Kết quả: {JSON.stringify(messages.map(m => `|${m.type}|${m.text}`))}
                </div>
            )}
        </div>
    );
}
