import { RenderItem } from "../types";
declare type Props<T> = {
    extraData?: any;
    drag: (itemKey: string) => void;
    item: T;
    renderItem: RenderItem<T>;
    itemKey: string;
    debug?: boolean;
};
declare function RowItem<T>(props: Props<T>): JSX.Element;
declare const _default: typeof RowItem;
export default _default;
