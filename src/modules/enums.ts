  // table:
export enum DisplayType {
  UNINITIALIZED,
  Checkbox = 1,
  Number,
  Text,
  Double,
  Date,
  DateTime,

  ARRAY,
  OBJECT,
  BINARY,
  Url,
  Color
  };
export enum form_type { object = 1, array };

export enum FormType {
    button = 1,
    checkbox,
    color,
    date,
    datetime_local,
    email,
    file,
    hidden,
    image,
    month,
    number,
    password,
    radio,
    range,
    reset,
    search,
    submit,
    tel,
    text,
    time,
    inserted_time,
    updated_time,
    url,
    week,
    textarea,
    select,
    jsoneditor,
    internal_true_edge,
    multi_select,
    multi_select_hidden, // not added input yet
    text_array,
    multi_select_bool_properties,
    flatpicker,
    WYSIWYG,
    serial,
    codemirror,
    save_time,
    inserted,
    updated,
    dropzone,
    daterange,
    prosemirror,
    cleditor
  };