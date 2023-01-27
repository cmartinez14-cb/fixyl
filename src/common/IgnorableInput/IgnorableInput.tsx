import React, { useState } from 'react';
import { Tooltip } from "antd";
import "./IgnorableInput.scss";
import { LM } from 'src/translations/language-manager';
import { LogoutOutlined, RollbackOutlined } from '@ant-design/icons';
import { FixField } from 'src/services/fix/FixDefs';
import { Select, Input, DatePicker, } from 'antd';
import { ListInput } from '../ListInput/ListInput';

const { Option } = Select

const FieldRenderEx = ({ value, field, required, parent, fieldIterationIndex, readOnly, secretEncoder, updaterMap, onChange}:
    { value: any, field: FixField, required: boolean, parent: string, fieldIterationIndex: number, readOnly: boolean, secretEncoder: (parent: string, data: any, fieldIterationIndex: number)=>void, updaterMap?: Map<number, Function>, onChange: (value: any) => void}) => {
    const [inputValue, setValue] = useState(value ? value : "");
    updaterMap && updaterMap.set(fieldIterationIndex, setValue);
    const onChangeEx = (value: any) => {
        setValue(value);
        onChange(value)
        secretEncoder && secretEncoder(parent, value, fieldIterationIndex);
    }

    const { def } = field;
    if (def.options && def.type.toLowerCase() !== "multiplecharvalue") {
        return <Select onChange={onChangeEx} value={inputValue}>
            {def.options.map((option, i) => {
                return <Option value={option.value} key={i}>{option.displayValue}</Option>
            })}
        </Select>
    }


    switch (def.type.toLowerCase()) {
        case "boolean":
            let ret = inputValue;
            if (typeof inputValue === "boolean") {
                ret = inputValue ? "Y" : "N"
            }

            return <Select onChange={onChangeEx} value={ret} >
                <Option key={"1"} value={""}>{""}</Option>
                <Option key={"Y"} value="Y">Y</Option>
                <Option key={"N"} value="N">N</Option>
            </Select>
        case "utctimestamp":
            return <DatePicker onChange={onChangeEx} showTime format="YYYY-MM-DD hh:mm:ss:ms" value={inputValue} />
        case "multiplecharvalue":
        case "multiplevaluestring":
            return <ListInput onChange={onChangeEx} name={def.name} parent={parent} options={def.options}
                required={required} fieldIterationIndex={fieldIterationIndex} value={inputValue} />
        case "monthyear":
            return <DatePicker onChange={onChangeEx} picker="month" value={inputValue} />
        case "utcdateonly":
            return <DatePicker onChange={onChangeEx} format="YYYY-MM-DD" value={inputValue} />
        case "utctimeonly":
            return <DatePicker picker="time" onChange={onChangeEx} value={inputValue} />
    }

    return <Input readOnly={readOnly} disabled={readOnly} onChange={(event) => onChangeEx(event.target.value)} value={inputValue} />
}

const getIntlMessage = (msg: string, options?: any) => {
    return LM.getMessage(`ignore_input.${msg}`, options);
}

export interface IgnorableInputProps {
    value?: any;
    componentProps: any;
    enableIgnore?: boolean;
    onChange?: (data: string) => void,
}

export const IgnorableInput = ({ enableIgnore, componentProps, onChange, value }: IgnorableInputProps) => {
    const [ignored, setIgnore] = useState(value === "{ignore}")
    if (!enableIgnore) {
        return <FieldRenderEx {...{ value, onChange, ...componentProps }} />
    }

    return (
        <div className="ignorable-input-container">
            {!ignored && <React.Fragment>
                <Tooltip title={getIntlMessage("ignore")}>
                    <div onClick={() => {
                        setIgnore(true)
                        onChange?.("{ignore}")
                    }} className="ignore-btn"><LogoutOutlined /></div>
                </Tooltip>
                {<FieldRenderEx {...{ value, onChange, ...componentProps }} />}
            </React.Fragment>}
            {ignored && <React.Fragment><Tooltip title={getIntlMessage("stop_ignore")}>
                <div onClick={() => {
                    setIgnore(false)
                    onChange?.("")
                }} className="ignore-btn"><RollbackOutlined /></div>
            </Tooltip>
                <div className="ignore-msg">{getIntlMessage("ignored_msg")}</div>

            </React.Fragment>}
        </div>
    );
};

