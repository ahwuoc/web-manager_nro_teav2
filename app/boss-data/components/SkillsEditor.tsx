'use client';

import { Button, InputNumber, Select, Space, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface SkillTemplate {
    id: number;
    NAME: string;
    nclass_id: number;
}

interface SkillsEditorProps {
    value: string;
    onChange: (value: string) => void;
    skillTemplates: { [key: number]: SkillTemplate };
}

// Format: [[skillId, level, cooldown], ...]
type Skill = [number, number, number];

export default function SkillsEditor({ value, onChange, skillTemplates }: SkillsEditorProps) {
    const parseSkills = (): Skill[] => {
        try {
            return JSON.parse(value) || [];
        } catch {
            return [];
        }
    };

    const skills = parseSkills();

    const updateSkills = (newSkills: Skill[]) => {
        onChange(JSON.stringify(newSkills));
    };

    const addSkill = () => {
        updateSkills([...skills, [0, 1, 1000]]);
    };

    const removeSkill = (index: number) => {
        updateSkills(skills.filter((_, i) => i !== index));
    };

    const updateSkill = (index: number, field: 0 | 1 | 2, val: number) => {
        const newSkills = [...skills];
        newSkills[index] = [...newSkills[index]] as Skill;
        newSkills[index][field] = val;
        updateSkills(newSkills);
    };

    const skillOptions = Object.values(skillTemplates).map(s => ({
        value: s.id,
        label: `${s.id} - ${s.NAME}`
    }));

    const columns = [
        {
            title: 'Skill',
            key: 'skillId',
            width: 250,
            render: (_: any, record: Skill, index: number) => (
                <Select
                    value={record[0]}
                    onChange={(val) => updateSkill(index, 0, val)}
                    options={skillOptions}
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    size="small"
                    style={{ width: '100%' }}
                    placeholder="Chọn skill"
                />
            ),
        },
        {
            title: 'Level',
            key: 'level',
            width: 100,
            render: (_: any, record: Skill, index: number) => (
                <InputNumber
                    min={1}
                    max={7}
                    value={record[1]}
                    onChange={(val) => updateSkill(index, 1, val ?? 1)}
                    size="small"
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Cooldown (ms)',
            key: 'cooldown',
            width: 120,
            render: (_: any, record: Skill, index: number) => (
                <InputNumber
                    min={0}
                    step={100}
                    value={record[2]}
                    onChange={(val) => updateSkill(index, 2, val ?? 1000)}
                    size="small"
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_: any, __: Skill, index: number) => (
                <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeSkill(index)}
                />
            ),
        },
    ];

    return (
        <div>
            <Table
                dataSource={skills}
                columns={columns}
                rowKey={(_, index) => index?.toString() ?? '0'}
                pagination={false}
                size="small"
                bordered
            />
            <Button
                type="dashed"
                onClick={addSkill}
                icon={<PlusOutlined />}
                className="mt-2 w-full"
            >
                Thêm skill
            </Button>
        </div>
    );
}
