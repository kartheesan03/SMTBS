async function testApis() {
  try {
    const resAtt = await fetch('http://localhost:5000/api/attendance');
    const dataAtt = await resAtt.json();
    console.log('Attendance:', resAtt.status, typeof dataAtt, Array.isArray(dataAtt) ? dataAtt.length : Object.keys(dataAtt));
  } catch (e) { console.log('Attendance Error:', e.message); }

  try {
    const resTask = await fetch('http://localhost:5000/api/tasks');
    const dataTask = await resTask.json();
    console.log('Tasks:', resTask.status, typeof dataTask, Array.isArray(dataTask) ? dataTask.length : Object.keys(dataTask));
  } catch (e) { console.log('Tasks Error:', e.message); }

  try {
    const resLev = await fetch('http://localhost:5000/api/leaves');
    const dataLev = await resLev.json();
    console.log('Leaves:', resLev.status, typeof dataLev, Array.isArray(dataLev) ? dataLev.length : Object.keys(dataLev));
  } catch (e) { console.log('Leaves Error:', e.message); }

  try {
    const resSal = await fetch('http://localhost:5000/api/salaries');
    const dataSal = await resSal.json();
    console.log('Salaries:', resSal.status, typeof dataSal, Array.isArray(dataSal) ? dataSal.length : Object.keys(dataSal));
  } catch (e) { console.log('Salaries Error:', e.message); }

  try {
    const resNotif = await fetch('http://localhost:5000/api/notifications');
    const dataNotif = await resNotif.json();
    console.log('Notifications:', resNotif.status, typeof dataNotif, Array.isArray(dataNotif) ? dataNotif.length : Object.keys(dataNotif));
  } catch (e) { console.log('Notifications Error:', e.message); }
}

testApis();
