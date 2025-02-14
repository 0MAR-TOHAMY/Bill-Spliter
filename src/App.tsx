import { useState } from 'react';
import { Plus, Trash2, Users, SplitSquareVertical as SplitSquare } from 'lucide-react';
import defaultImg from './default.png';

interface Friend {
  name: string;
  image?: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  splitWith: string;
}

function App() {
  const [myName] = useState('Me');
  const [friends, setFriends] = useState<Friend[]>([{ name: myName }]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newFriend, setNewFriend] = useState('');
  const [newFriendImage, setNewFriendImage] = useState('');
  const [directPayments, setDirectPayments] = useState<Record<string, number>>({});

  const addFriend = () => {
    if (newFriend.trim() && !friends.some(friend => friend.name === newFriend.trim())) {
      setFriends([...friends, { name: newFriend.trim(), image: newFriendImage.trim() || defaultImg }]);
      setNewFriend('');
      setNewFriendImage('');
    }
  };

  const removeFriend = (index: number) => {
    if (friends[index].name !== myName) {
      const friendToRemove = friends[index].name;
      setFriends(friends.filter((_, i) => i !== index));
      setExpenses(expenses.filter(expense => 
        expense.paidBy !== friendToRemove && expense.splitWith !== friendToRemove
      ));
      const newDirectPayments = { ...directPayments };
      delete newDirectPayments[friendToRemove];
      setDirectPayments(newDirectPayments);
    }
  };

  const addExpense = (splitWith: string) => {
    const newExpense: Expense = {
      id: Date.now(),
      description: '',
      amount: 0,
      paidBy: myName,
      splitWith,
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: number, field: keyof Expense, value: string | number) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const calculateExpenseSummary = (friend: string) => {
    const friendExpenses = expenses.filter(expense => expense.splitWith === friend);
    const totalExpenses = friendExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const youPaid = directPayments[friend] || 0;
    const theyPaid = totalExpenses - youPaid;
    
    return { totalExpenses, youPaid, theyPaid };
  };

  const handleDirectPaymentChange = (friend: string, amount: number) => {
    setDirectPayments(prev => ({
      ...prev,
      [friend]: Math.min(Math.max(0, amount), calculateExpenseSummary(friend).totalExpenses)
    }));
  };

  const calculateBalance = (friend: string) => {
    const { totalExpenses, youPaid } = calculateExpenseSummary(friend);
    const expectedShare = totalExpenses / 2;
    return youPaid - expectedShare;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
            <SplitSquare className="w-8 h-8 sm:w-10 sm:h-10" />
            Split Bills
          </h1>
          <p className="text-gray-600">Track individual expenses with friends</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              placeholder="Add friend's name"
              className="flex-1 px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={newFriendImage}
              onChange={(e) => setNewFriendImage(e.target.value)}
              placeholder="Image URL (optional)"
              className="flex-1 px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addFriend}
              className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="sm:hidden">Add Friend</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {friends.map((friend, index) => (
              <div
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span>{friend.name}</span>
                {friend.name !== myName && (
                  <button
                    onClick={() => removeFriend(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {friends.filter(friend => friend.name !== myName).map(friend => {
          const { totalExpenses, youPaid, theyPaid } = calculateExpenseSummary(friend.name);
          return (
            <div key={friend.name} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {friend.image && (
                    <img src={friend.image} alt={friend.name} className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    {friend.name}
                  </h2>
                </div>
                <button
                  onClick={() => addExpense(friend.name)}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Expense
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-lg sm:text-xl font-semibold">${totalExpenses.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Your Payment</div>
                  <input
                    type="number"
                    value={directPayments[friend.name] || 0}
                    onChange={(e) => handleDirectPaymentChange(friend.name, parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-center border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg sm:text-xl font-semibold text-green-600"
                    min="0"
                    max={totalExpenses}
                    step="0.01"
                  />
                  <div className="text-xs text-gray-500">({((youPaid / totalExpenses) * 100 || 0).toFixed(1)}%)</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">{friend.name}'s Payment</div>
                  <div className="text-lg sm:text-xl font-semibold text-blue-600">${theyPaid.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">({((theyPaid / totalExpenses) * 100 || 0).toFixed(1)}%)</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Each Should Pay</div>
                  <div className="text-lg sm:text-xl font-semibold text-gray-600">${(totalExpenses / 2).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">(50%)</div>
                </div>
              </div>
              
              {expenses.filter(expense => expense.splitWith === friend.name).map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4 p-4 bg-gray-50 rounded-2xl"
                >
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) =>
                      updateExpense(expense.id, 'description', e.target.value)
                    }
                    placeholder="Description"
                    className="w-full sm:flex-1 px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex w-full sm:w-auto items-center gap-4">
                    <input
                      type="number"
                      value={expense.amount}
                      onChange={(e) =>
                        updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)
                      }
                      placeholder="Amount"
                      className="flex-1 sm:w-32 px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="font-medium">Balance with {friend.name}</span>
                  <span
                    className={`text-lg sm:text-xl font-semibold ${
                      calculateBalance(friend.name) > 0 
                        ? 'text-green-600' 
                        : calculateBalance(friend.name) < 0 
                        ? 'text-red-600' 
                        : ''
                    }`}
                  >
                    {calculateBalance(friend.name) > 0 ? '+' : ''}
                    ${calculateBalance(friend.name).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {calculateBalance(friend.name) > 0
                    ? `${friend.name} owes you $${calculateBalance(friend.name).toFixed(2)}`
                    : calculateBalance(friend.name) < 0
                    ? `You owe ${friend.name} $${Math.abs(calculateBalance(friend.name)).toFixed(2)}`
                    : 'You are all settled up!'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;