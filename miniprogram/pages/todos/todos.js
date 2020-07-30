const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
//获取年
for (let i = date.getFullYear(); i <= date.getFullYear() + 5; i++) {
  years.push("" + i);
}
//获取月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
//获取分钟
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}
Page({
  data: {
    input: '',
    todos: [],
    leftCount: 0,
    allCompleted: false,
    logs: [],
    time: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [],
    choose_year: '',
    disable: true,
    input_length: false,
    time_length: false
  },

  save: function () {
    wx.setStorageSync('todo_list', this.data.todos)
    wx.setStorageSync('todo_logs', this.data.logs)
  },

  load: function () {
    var todos = wx.getStorageSync('todo_list')
    if (todos) {
      var leftCount = todos.filter(function (item) {
        return !item.completed
      }).length
      this.setData({ todos: todos, leftCount: leftCount })
    }
    var logs = wx.getStorageSync('todo_logs')
    if (logs) {
      this.setData({ logs: logs })
    }
  },

  onLoad: function () {
    this.load()
    var nowDate = new Date();
    // console.log(1,nowDate)
    var year = nowDate.getFullYear(), month = (nowDate.getMonth()+1)%12, day = nowDate.getDay();
    var hour = nowDate.getHours(), minute = nowDate.getMinutes()
    if(month == 0) month = 12
    // console.log(year, month, day)
    var index = [year, month, day, hour, minute]
    this.setData({
      multiIndex: index,
      disable: true,
      input_length: false,
      time_length: false
    })
    this.setData({ choose_year: this.data.multiArray[0][0] })
  },

  inputChangeHandle: function (e) {
    if(e.detail.value.length > 0) this.setData({ input_length: true })
    else this.setData({ input_length: false })
    this.setData({ disable: !(this.data.input_length & this.data.time_length) })
    console.log("input",this.data.disable, this.data.input_length, this.data.time_length)
    
    this.setData({ input: e.detail.value })
  },

  addTodoHandle: function (e) {
    if (!this.data.input || !this.data.input.trim()) return
    var todos = this.data.todos
    todos.push({ name: this.data.input, completed: false, time: this.data.time })
    var logs = this.data.logs
    logs.push({ timestamp: new Date(), action: '添加', name: this.data.input, time: this.data.time })
    this.setData({
      input: '',
      todos: todos,
      leftCount: this.data.leftCount + 1,
      logs: logs,
      time: '',
      disable: true,
      input_length: false,
      time_length: false
    })
    this.save()
  },

  toggleTodoHandle: function (e) {
    var index = e.currentTarget.dataset.index
    var todos = this.data.todos
    todos[index].completed = !todos[index].completed
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: todos[index].completed ? '完成' : '重新开始',
      name: todos[index].name,
      time: todos[index].time
    })
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount + (todos[index].completed ? -1 : 1),
      logs: logs
    })
    this.save()
  },

  removeTodoHandle: function (e) {
    var index = e.currentTarget.dataset.index
    var todos = this.data.todos
    var remove = todos.splice(index, 1)[0]
    var logs = this.data.logs
    logs.push({ timestamp: new Date(), action: '删除', name: remove.name, time: remove.time })
    this.setData({
      todos: todos,
      leftCount: this.data.leftCount - (remove.completed ? 0 : 1),
      logs: logs
    })
    this.save()
  },

  toggleAllHandle: function (e) {
    this.data.allCompleted = !this.data.allCompleted
    var todos = this.data.todos
    for (var i = todos.length - 1; i >= 0; i--) {
      todos[i].completed = this.data.allCompleted
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: this.data.allCompleted ? '完成' : '重新开始',
      name: '所有事项',
      time: '...'
    })
    this.setData({
      todos: todos,
      leftCount: this.data.allCompleted ? 0 : todos.length,
      logs: logs
    })
    this.save()
  },
  
  clearCompletedHandle: function (e) {
    var todos = this.data.todos
    var remains = []
    for (var i = 0; i < todos.length; i++) {
      todos[i].completed || remains.push(todos[i])
    }
    var logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: '清除',
      name: '完成所有事项',
      time: '...'
    })
    this.setData({ todos: remains, logs: logs })
    this.save()
  },
  // 获取日期时间
  bindMultiPickerChange: function(e) {
    if(e.detail.value.length > 0) this.setData({ time_length: true })
    else this.setData({ time_length: false })
    this.setData({ disable: !(this.data.input_length & this.data.time_length) })
    console.log("cal",this.data.disable, this.data.input_length, this.data.time_length)
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
    if(e.detail.value.length > 0) this.setData({ time_length: true })
    else this.setData({ time_length: false })
    this.setData({ disable: !(this.input_length & this.time_length) })
    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    this.setData({
      time: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    })
    // console.log(this.data.time);
  },
  //监听picker的滚动事件
  bindMultiPickerColumnChange: function(e) {
    //获取年份
    if (e.detail.column == 0) {
      let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
      // console.log(choose_year);
      this.setData({ choose_year })
    }
    //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) i = "0" + i;
          temp.push("" + i);
        }
        this.setData({ ['multiArray[2]']: temp });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) i = "0" + i; 
          temp.push("" + i);
        }
        this.setData({ ['multiArray[2]']: temp });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choose_year);
        // console.log(year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) i = "0" + i;
            temp.push("" + i);
          }
          this.setData({ ['multiArray[2]']: temp });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) i = "0" + i;
            temp.push("" + i);
          }
          this.setData({ ['multiArray[2]']: temp });
        }
      }
      // console.log(this.data.multiArray[2]);
    }
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
})
